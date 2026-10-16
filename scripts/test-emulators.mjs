import assert from "node:assert/strict";
const project = process.env.GCLOUD_PROJECT;
assert(project?.startsWith("demo-"), "Refuse to run without an explicitly isolated demo-* project.");
function localOrigin(host) {
  assert(host, "Start both Auth and Firestore emulators using test:emulator.");
  const url = new URL(`http://${host}`);
  assert(["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) && !url.username && !url.password, "Refuse any non-loopback emulator host.");
  return url.origin;
}
const firestore = localOrigin(process.env.FIRESTORE_EMULATOR_HOST);
const auth = localOrigin(process.env.FIREBASE_AUTH_EMULATOR_HOST);
const database = `${firestore}/v1/projects/${project}/databases/(default)`;
async function request(url, method = "GET", body, token) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, data: await response.json().catch(() => null) };
}
const doc = path => `${database}/documents/${path}`;
async function denied(url, method, body, token) {
  const response = await request(url, method, body, token);
  assert.equal(response.status, 403, `Expected rules denial for ${method ?? "GET"}; received ${response.status}`);
  assert.equal(response.data.error.status, "PERMISSION_DENIED");
}
// Owner is an emulator-only administrative bypass, never used by application code.
await request(doc("hsp_students/test-student"), "PATCH", { fields: { outstanding: { integerValue: "150000" } } }, "owner");
await request(doc("hsp_payments/existing"), "PATCH", { fields: { amount: { integerValue: "100" } } }, "owner");
await denied(doc("hsp_students/test-student"));
await denied(doc("hsp_students") + "?pageSize=1");
let checks = 2;
for (const role of ["homeroom_teacher", "finance_teacher", "finance_officer", "executive", "superadmin"]) {
  const result = await request(`${auth}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-emulator-only`, "POST", { email: `${role}@example.invalid`, password: "fictional-emulator-only-password", returnSecureToken: true });
  assert.equal(result.status, 200, "Auth emulator signup fixture failed.");
  const { idToken, localId } = result.data;
  assert(idToken && localId);
  await request(doc(`hsp_roles/${localId}`), "PATCH", { fields: { role: { stringValue: role }, active: { booleanValue: true }, assignedRooms: { arrayValue: { values: [{ stringValue: "m2-1" }] } } } }, "owner");
  await denied(doc("hsp_students/test-student"), "GET", undefined, idToken);
  await denied(doc(`hsp_roles/${localId}`), "PATCH", { fields: { role: { stringValue: "superadmin" } } }, idToken);
  await denied(doc("hsp_payments/existing"), "DELETE", undefined, idToken);
  await denied(doc("hsp_audit/forged"), "PATCH", { fields: { actor: { stringValue: localId } } }, idToken);
  await denied(`${database}/documents:commit`, "POST", { writes: [
    { update: { name: `projects/${project}/databases/(default)/documents/hsp_students/test-student`, fields: { outstanding: { integerValue: "0" } } } },
    { update: { name: `projects/${project}/databases/(default)/documents/hsp_payments/forged`, fields: { amount: { integerValue: "150000" } } } },
  ] }, idToken);
  checks += 5;
}
const unchanged = await request(doc("hsp_students/test-student"), "GET", undefined, "owner");
assert.equal(unchanged.data.fields.outstanding.integerValue, "150000");
console.log(`Emulator quarantine baseline passed: ${checks} direct REST denials across unauthenticated access and five role fixtures; rejected multi-document commits leave the seed unchanged. No live RBAC or positive financial-write proof is claimed.`);
