// Admin: Audit Log

const AdminAudit = ({ setRoute }) => {
  const events = [
    { ts: "15 พ.ค. 2569 09:42:18", actor: "ระบบอัตโนมัติ", role: "system", action: "ยืนยันการชำระเงินอัตโนมัติ", target: "INV-2569-018421", diff: ["pending → paid"], ip: "—", risk: "low" },
    { ts: "15 พ.ค. 2569 09:14:02", actor: "ครูชนัญพร", role: "finance", action: "ออกใบเสร็จรับเงิน", target: "R6907-00482 (INV-2569-018421)", diff: ["receipt_status: ready → issued"], ip: "10.16.4.22", risk: "low" },
    { ts: "15 พ.ค. 2569 08:31:00", actor: "ระบบอัตโนมัติ", role: "system", action: "นำเข้าไฟล์ Settlement", target: "settlement_2605151700.csv", diff: ["imported: 248 records"], ip: "—", risk: "low" },
    { ts: "15 พ.ค. 2569 08:02:14", actor: "ระบบอัตโนมัติ", role: "system", action: "ตรวจพบยอดไม่ตรง · ส่งเข้า Manual Review", target: "INV-2569-018307", diff: ["pending → under_review"], ip: "—", risk: "med" },
    { ts: "14 พ.ค. 2569 17:48:09", actor: "ครูชนัญพร", role: "super_admin", action: "หมุนรหัสลับ Webhook", target: "Webhook KTB Production", diff: ["secret: ••5102 → ••2c8f"], ip: "10.16.4.18", risk: "high" },
    { ts: "14 พ.ค. 2569 14:12:33", actor: "ครูชนัญพร", role: "finance", action: "ยกเลิกใบเสร็จ &amp; ออกใหม่", target: "R6907-00478 → R6907-00478A", diff: ["receipt: issued → voided · reissued"], ip: "10.16.4.22", risk: "high" },
    { ts: "14 พ.ค. 2569 11:30:48", actor: "ครูพิมพ์ลดา", role: "finance", action: "ปรับยอดใบแจ้งชำระด้วยมือ", target: "INV-2569-016842", diff: ["amount: 4,200 → 3,800 (ส่วนลดทุนช่วยเหลือ)"], ip: "10.16.4.31", risk: "med" },
    { ts: "13 พ.ค. 2569 10:08:22", actor: "ครูชนัญพร", role: "super_admin", action: "เปลี่ยนการตั้งค่า Counter Service", target: "Fee handling", diff: ["fee_mode: parent → include"], ip: "10.16.4.18", risk: "high" },
    { ts: "13 พ.ค. 2569 09:54:11", actor: "ครูพิมพ์ลดา", role: "finance", action: "ส่งออกรายงาน", target: "รายการรับชำระ Counter Service 1–13 พ.ค.", diff: ["format: xlsx · rows: 1,184"], ip: "10.16.4.31", risk: "low" },
    { ts: "12 พ.ค. 2569 09:00:00", actor: "ระบบอัตโนมัติ", role: "system", action: "สร้างใบแจ้งชำระแบบกลุ่ม", target: "CMP-2569-02 · ค่ากิจกรรมพัฒนาผู้เรียน", diff: ["created: 1,742 invoices · ฿2,090,400"], ip: "—", risk: "low" },
  ];

  const roleLabel = {
    system: "ระบบ", finance: "การเงิน", super_admin: "ผู้ดูแลระบบ", teacher: "ครูประจำชั้น",
  };
  const riskMeta = {
    low: { label: "ต่ำ", cls: "draft" },
    med: { label: "ปานกลาง", cls: "review" },
    high: { label: "สูง", cls: "danger" },
  };

  return (
    <>
      <Topbar crumb={["ประวัติการเปลี่ยนแปลง · Audit Log"]} />
      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-h1">ประวัติการเปลี่ยนแปลง</h1>
            <p className="page-sub">บันทึกทุกการกระทำที่กระทบยอดเงิน · การตั้งค่า · และเอกสารทางการเงิน · ไม่สามารถลบได้</p>
          </div>
          <div className="flex">
            <button className="btn"><Icon name="download" size={13} /> ส่งออก CSV</button>
            <button className="btn"><Icon name="shield" size={13} /> รายงานความปลอดภัย</button>
          </div>
        </div>

        <div className="kpis" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
          <div className="kpi">
            <div className="kpi-label">เหตุการณ์วันนี้</div>
            <div className="kpi-value" style={{fontSize: 22}}>2,486</div>
            <div className="kpi-delta">98.4% เป็นเหตุการณ์ระบบอัตโนมัติ</div>
          </div>
          <div className="kpi accent-danger">
            <div className="kpi-label">ความเสี่ยงสูง 7 วัน</div>
            <div className="kpi-value" style={{fontSize: 22}}>4</div>
            <div className="kpi-delta">หมุนรหัสลับ 1 · Void ใบเสร็จ 2 · ปรับยอด 1</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">การเข้าสู่ระบบที่ผิดปกติ</div>
            <div className="kpi-value" style={{fontSize: 22}}>0</div>
            <div className="kpi-delta">ตรวจ IP / Device · ปกติทั้งหมด</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">ระยะการเก็บข้อมูล</div>
            <div className="kpi-value" style={{fontSize: 22}}>10 ปี</div>
            <div className="kpi-delta">ตามนโยบายโรงเรียน · สำรอง S3 รายวัน</div>
          </div>
        </div>

        <div className="card" style={{marginTop: 16}}>
          <div className="filters">
            <div className="filter"><Icon name="calendar" size={12} /> วันที่: <b>1–15 พ.ค. 2569</b></div>
            <div className="filter">ผู้กระทำ: <b>ทั้งหมด</b></div>
            <div className="filter">ประเภท: <b>ทั้งหมด</b></div>
            <div className="filter">ความเสี่ยง: <b>ทุกระดับ</b></div>
            <div className="filter"><Icon name="search" size={12} /> ค้นหา target/IP</div>
            <div style={{flex: 1}} />
            <div className="filter">เรียงโดย: <b>เวลาล่าสุด</b></div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{width: 150}}>เวลา</th>
                <th style={{width: 200}}>ผู้กระทำ</th>
                <th style={{width: 220}}>การกระทำ</th>
                <th>เป้าหมาย / ก่อน → หลัง</th>
                <th style={{width: 110}}>IP / Device</th>
                <th style={{width: 90}}>ความเสี่ยง</th>
                <th style={{width: 28}}></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td className="mono" style={{fontSize: 11.5}}>{e.ts}</td>
                  <td>
                    <div className="flex" style={{gap: 8}}>
                      {e.role === "system" ?
                        <div className="avatar-sm" style={{background: "var(--bg-soft)", color: "var(--muted)"}}><Icon name="sparkle" size={11} /></div> :
                        <Avatar name={e.actor} size={26} />}
                      <div className="stack">
                        <span style={{fontSize: 12.5, fontWeight: 500}}>{e.actor}</span>
                        <span className="sub latin">{roleLabel[e.role]}</span>
                      </div>
                    </div>
                  </td>
                  <td dangerouslySetInnerHTML={{__html: e.action}} style={{fontSize: 12.5}} />
                  <td>
                    <div className="stack">
                      <span className="mono" style={{fontSize: 11.5}}>{e.target}</span>
                      {e.diff.map((d, j) => {
                        const parts = d.split("→");
                        return (
                          <span key={j} className="sub mono" style={{fontSize: 11}}>
                            {parts.length === 2 ? (
                              <>
                                <span style={{background: "var(--danger-soft)", color: "var(--danger)", padding: "0 4px", borderRadius: 2}}>{parts[0].trim()}</span>
                                <span style={{margin: "0 6px", color: "var(--muted)"}}>→</span>
                                <span style={{background: "var(--emerald-soft)", color: "var(--emerald-2)", padding: "0 4px", borderRadius: 2}}>{parts[1].trim()}</span>
                              </>
                            ) : d}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="mono" style={{fontSize: 11.5, color: "var(--muted)"}}>{e.ip}</td>
                  <td><span className={"badge " + riskMeta[e.risk].cls} style={{fontSize: 10.5, padding: "1px 6px"}}><span className="dot" />{riskMeta[e.risk].label}</span></td>
                  <td><Icon name="chevronRight" size={13} color="#8A95A3" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={2486} page={1} pageSize={10} />
        </div>
      </div>
    </>
  );
};

window.AdminAudit = AdminAudit;
