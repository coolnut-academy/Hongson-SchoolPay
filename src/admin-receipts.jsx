// Admin: Receipt Center + Official Receipt Preview + Reimbursement Doc Pack

const AdminReceipts = ({ setRoute }) => {
  const [tab, setTab] = React.useState("preview");

  const queue = [
    { id: "R6907-00482", inv: "INV-2569-018421", name: "เด็กชายภาคิน วงศ์อิสรกุล", cls: "ม.5/1", amt: 4200, paid: "15 พ.ค. 09:42", status: "issued", reim: true },
    { id: "R6907-00481", inv: "INV-2569-018407", name: "เด็กหญิงพิมพ์ลภัส รักษ์เผ่า", cls: "ม.5/1", amt: 4200, paid: "15 พ.ค. 09:37", status: "issued", reim: false },
    { id: "R6907-00480", inv: "INV-2569-018395", name: "เด็กชายธีรเดช สุขสันต์ชัย", cls: "ม.4/2", amt: 5800, paid: "15 พ.ค. 09:31", status: "ready", reim: true },
    { id: "—",          inv: "INV-2569-018384", name: "เด็กชายกฤตเมธ เรืองศิริ", cls: "ม.3/1", amt: 4200, paid: "15 พ.ค. 09:06", status: "ready", reim: false },
    { id: "—",          inv: "INV-2569-018178", name: "เด็กหญิงอัญชิสา ภักดีศรี", cls: "ม.6/1", amt: 5800, paid: "15 พ.ค. 08:36", status: "ready", reim: true },
    { id: "—",          inv: "INV-2569-017994", name: "เด็กชายภวินท์ บุญถนอม", cls: "ป.5/2", amt: 4200, paid: "14 พ.ค. 16:18", status: "pending", reim: false },
    { id: "R6907-00478", inv: "INV-2569-017822", name: "เด็กหญิงณภัทร เลิศพานิชย์", cls: "ม.2/3", amt: 4200, paid: "14 พ.ค. 14:08", status: "voided", reim: false },
  ];

  return (
    <>
      <Topbar crumb={["ใบเสร็จรับเงิน"]} />
      <div className="content" style={{maxWidth: 1640}}>
        <div className="page-head">
          <div>
            <h1 className="page-h1">ศูนย์ออกใบเสร็จรับเงิน</h1>
            <p className="page-sub">ออกใบเสร็จอย่างเป็นทางการของโรงเรียน · พร้อมเทมเพลตสำหรับการเบิกค่าการศึกษาบุตรของผู้ปกครองข้าราชการ</p>
          </div>
          <div className="flex">
            <button className="btn"><Icon name="print" size={13} /> พิมพ์ทั้งหมด</button>
            <button className="btn primary"><Icon name="receipt" size={13} /> ออกใบเสร็จกลุ่ม 74 รายการ</button>
          </div>
        </div>

        <div className="kpis" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
          <div className="kpi accent-emerald">
            <div className="kpi-label">ออกใบเสร็จแล้วเดือนนี้</div>
            <div className="kpi-value">1,184</div>
            <div className="kpi-delta">≈ ฿4,972,800 · เลขที่ล่าสุด R6907-00482</div>
          </div>
          <div className="kpi accent-gold">
            <div className="kpi-label">รอเจ้าหน้าที่อนุมัติ</div>
            <div className="kpi-value">42</div>
            <div className="kpi-delta">12 เป็นใบเสร็จเบิกค่าการศึกษาบุตร</div>
          </div>
          <div className="kpi accent-navy">
            <div className="kpi-label">พร้อมออกอัตโนมัติ</div>
            <div className="kpi-value">32</div>
            <div className="kpi-delta">ยืนยันยอดเรียบร้อย · รอออกตาม schedule</div>
          </div>
          <div className="kpi accent-danger">
            <div className="kpi-label">ยกเลิก / ออกใหม่</div>
            <div className="kpi-value">3</div>
            <div className="kpi-delta">ทุกใบมีเหตุผลและ Audit Log</div>
          </div>
        </div>

        <div className="grid-2" style={{marginTop: 16}}>
          {/* LEFT: queue */}
          <div className="card">
            <div className="card-head">
              <h3>คิวการออกใบเสร็จ</h3>
              <div className="flex" style={{gap: 6}}>
                <button className="btn sm"><Icon name="filter" size={11} /> ตัวกรอง</button>
                <button className="btn sm"><Icon name="download" size={11} /> ส่งออก</button>
              </div>
            </div>
            <div className="filters" style={{padding: "8px 14px"}}>
              <div className="filter">รอบเก็บเงิน: <b>CMP-2569-01</b></div>
              <div className="filter">ประเภท: <b>ทั้งหมด</b></div>
              <div className="filter">สถานะ: <b>ทั้งหมด</b></div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{width: 18}}><span className="checkbox" /></th>
                  <th>เลขที่ใบเสร็จ</th>
                  <th>นักเรียน</th>
                  <th className="r">ยอด</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q, i) => (
                  <tr key={i}>
                    <td><span className="checkbox" /></td>
                    <td>
                      <div className="stack">
                        <span className="mono" style={{fontSize: 12, fontWeight: 500}}>{q.id}</span>
                        <span className="sub mono">{q.inv}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stack">
                        <span>{q.name}</span>
                        <span className="sub">{q.cls} · ชำระ {q.paid}</span>
                      </div>
                    </td>
                    <td className="r">{fmt(q.amt)}</td>
                    <td>
                      <div className="flex-col" style={{gap: 4, alignItems: "flex-start"}}>
                        <Badge status={q.status} />
                        {q.reim && <span className="badge gold" style={{fontSize: 10.5, padding: "1px 6px"}}>เบิกฯ บุตร</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={284} page={1} pageSize={20} />
          </div>

          {/* RIGHT: preview pane */}
          <div className="flex-col" style={{gap: 12}}>
            <div className="card">
              <div className="tabs" style={{padding: "0 12px"}}>
                <div className={"tab " + (tab === "preview" ? "active" : "")} onClick={() => setTab("preview")}>
                  <Icon name="eye" size={13} /> ใบเสร็จรับเงิน
                </div>
                <div className={"tab " + (tab === "pack" ? "active" : "")} onClick={() => setTab("pack")}>
                  <Icon name="fileText" size={13} /> ชุดเอกสารเบิกค่าการศึกษาบุตร
                </div>
                <div className={"tab " + (tab === "qr" ? "active" : "")} onClick={() => setTab("qr")}>
                  <Icon name="qr" size={13} /> QR ตรวจสอบความถูกต้อง
                </div>
              </div>
              <div style={{padding: 16, background: "var(--bg-soft)"}}>
                {tab === "preview" && <ReceiptPreview />}
                {tab === "pack" && <DocPackPreview />}
                {tab === "qr" && <QRVerifyPreview />}
              </div>
            </div>

            <div className="card card-pad">
              <div className="flex" style={{marginBottom: 6}}>
                <Avatar name="ครูชนัญพร" size={32} />
                <div className="grow">
                  <div style={{fontSize: 13, fontWeight: 600}}>ผู้อนุมัติการออกใบเสร็จ</div>
                  <div className="tiny muted">ครูชนัญพร · ผู้ดูแลระบบการเงินโรงเรียน</div>
                </div>
              </div>
              <div className="tiny muted" style={{marginBottom: 12, padding: 8, background: "var(--bg-soft)", borderRadius: 6, lineHeight: 1.55}}>
                <Icon name="info" size={11} /> เอกสารใบเสร็จจะลงนามด้วยข้อมูล <b>ผู้รับเงิน · ผู้ตรวจสอบรายการ · ผู้มีอำนาจลงนาม</b> ตามที่กำหนดไว้ในเทมเพลตใบเสร็จ ไม่ใช่ผู้อนุมัติในระบบ
              </div>
              <div className="flex" style={{gap: 8}}>
                <button className="btn"><Icon name="x" size={13} /> ปฏิเสธ &amp; แจ้งกลับ</button>
                <button className="btn primary grow" style={{justifyContent: "center"}}><Icon name="check" size={13} /> อนุมัติและออกใบเสร็จ</button>
              </div>
              <div className="tiny muted" style={{marginTop: 10, textAlign: "center"}}>
                <Icon name="shield" size={11} /> การออกใบเสร็จจะถูกบันทึกใน Audit Log พร้อม IP และเวลา ไม่สามารถลบได้ ใช้ Void/Reissue เท่านั้น
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ===== Receipt preview =====
const ReceiptPreview = () => {
  const items = [
    { n: "ค่าบำรุงการศึกษา", a: 3500 },
    { n: "ค่าสาธารณูปโภค", a: 400 },
    { n: "ค่าประกันอุบัติเหตุนักเรียน", a: 200 },
    { n: "ค่ากิจกรรมพิเศษ", a: 100 },
  ];
  const total = 4200;
  return (
    <div style={{display: "flex", justifyContent: "center"}}>
      <div className="receipt" style={{maxWidth: 720, padding: "36px 44px"}}>
        <div className="receipt-watermark">ORIGINAL</div>
        <div className="receipt-head">
          <div className="school-crest">ตราโรงเรียน<br/>SCHOOL<br/>SEAL</div>
          <div>
            <h2 className="receipt-school-name">โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ</h2>
            <div className="receipt-school-sub">
              เลขที่ 12 ถนนขุนลุมประพาส ตำบลจองคำ อำเภอเมือง จังหวัดแม่ฮ่องสอน 58000<br/>
              โทรศัพท์ 0-5361-XXXX · เลขประจำตัวผู้เสียภาษี 0-9940-00155-01-0 · รหัสสถานศึกษา 1058100015
            </div>
          </div>
          <div className="receipt-title-block">
            <div className="receipt-doc-title">ใบเสร็จรับเงิน</div>
            <div className="receipt-doc-sub">RECEIPT · ใบเสร็จรับเงินของสถานศึกษา</div>
            <div className="mono" style={{fontSize: 12, marginTop: 6}}>เลขที่ <b>R6907-00482</b></div>
            <div className="tiny muted latin">เล่มที่ 67/2569 · ฉบับสำหรับเบิกค่าการศึกษาบุตร</div>
          </div>
        </div>

        <div className="receipt-meta">
          <div><span className="k">ได้รับเงินจาก</span><span className="v">นายธวัชชัย วงศ์อิสรกุล</span></div>
          <div><span className="k">วันที่</span><span className="v">15 พฤษภาคม 2569</span></div>
          <div><span className="k">นักเรียน</span><span className="v">เด็กชายภาคิน วงศ์อิสรกุล</span></div>
          <div><span className="k">รหัสนักเรียน</span><span className="v mono">65120184</span></div>
          <div><span className="k">ระดับชั้น</span><span className="v">มัธยมศึกษาปีที่ 5/1</span></div>
          <div><span className="k">ปีการศึกษา</span><span className="v">2569 ภาคเรียนที่ 1</span></div>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th style={{width: 40}}>ที่</th>
              <th>รายการ</th>
              <th className="r" style={{width: 130}}>จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td className="latin muted">{i + 1}</td>
                <td>{it.n}</td>
                <td className="r">{fmt(it.a)}</td>
              </tr>
            ))}
            <tr><td colSpan="3" style={{height: 20, border: "none"}}></td></tr>
            <tr className="total">
              <td colSpan="2">ยอดรวมทั้งสิ้น</td>
              <td className="r">{fmt(total)}</td>
            </tr>
            <tr><td colSpan="3" className="amount-thai" style={{border: "none"}}>(สี่พันสองร้อยบาทถ้วน)</td></tr>
          </tbody>
        </table>

        <div style={{display: "flex", justifyContent: "space-between", fontSize: 11.5, gap: 14, marginTop: 4}}>
          <div>
            <div className="muted">ชำระโดย: <b style={{color: "var(--text)"}}>Mobile Banking QR · KrungThai NEXT</b></div>
            <div className="muted">รหัสธุรกรรม: <span className="mono">TX-KB-26051509421783</span></div>
            <div className="muted">รหัสอ้างอิงใบแจ้งชำระ: <span className="mono">INV-2569-018421</span></div>
          </div>
          <div style={{textAlign: "right"}}>
            <div className="muted" style={{marginBottom: 2}}>หมายเหตุ:</div>
            <div style={{fontSize: 11, lineHeight: 1.5, maxWidth: 280}}>เอกสารชุดนี้จัดทำเพื่อใช้ประกอบการยื่นเบิกค่าการศึกษาบุตร ทั้งนี้การอนุมัติขึ้นอยู่กับหลักเกณฑ์ของหน่วยงานต้นสังกัด</div>
          </div>
        </div>

        <div className="receipt-foot" style={{gridTemplateColumns: "1fr 1fr 1fr"}}>
          <div>
            <div className="sig-block">
              <div style={{fontWeight: 600, fontSize: 12}}>นางสาวพิมพ์ลดา ศรีวิชัย</div>
              <div style={{fontSize: 11, color: "var(--muted)"}}>เจ้าหน้าที่การเงิน<br/>ผู้รับเงิน</div>
            </div>
          </div>
          <div>
            <div className="sig-block">
              <div style={{fontWeight: 600, fontSize: 12}}>นางอาภาภรณ์ ดวงดี</div>
              <div style={{fontSize: 11, color: "var(--muted)"}}>หัวหน้ากลุ่มงานบริหารงบประมาณ<br/>ผู้ตรวจสอบรายการ</div>
            </div>
          </div>
          <div>
            <div className="sig-block">
              <div style={{fontWeight: 600, fontSize: 12}}>นายสมศักดิ์ ใจดี</div>
              <div style={{fontSize: 11, color: "var(--muted)"}}>ผู้อำนวยการสถานศึกษา<br/>ผู้มีอำนาจลงนาม</div>
            </div>
          </div>
        </div>

        <div className="flex" style={{justifyContent: "center", marginTop: 16}}>
          <div className="school-seal">ประทับ<br/>ตราโรงเรียน<br/>(School Seal)</div>
        </div>

        <div className="qr-verify">
          <div className="qr-mini" />
          <div>
            <b>ตรวจสอบความถูกต้องของใบเสร็จ</b><br/>
            <span className="mono">https://pay.hongson.ac.th/v/R6907-00482</span> · ออกโดย SchoolPay v3.1
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== Reimbursement document pack =====
const DocPackPreview = () => {
  const docs = [
    { t: "ใบเสร็จรับเงินของโรงเรียน", d: "เอกสารต้นฉบับ ลงนามโดยเจ้าหน้าที่การเงิน · 1 แผ่น", icon: "receiptCheck", emphasis: true },
    { t: "หนังสือรับรองการเก็บเงินบำรุงการศึกษา", d: "ลงนามโดยผู้อำนวยการ ตามระเบียบกระทรวงการคลัง · 1 แผ่น", icon: "fileText" },
    { t: "รายละเอียดรายการค่าธรรมเนียม", d: "แยกเป็นรายรายการตามเอกสารแนบประกาศโรงเรียน · 1 แผ่น", icon: "list" },
    { t: "หนังสือรับรองการเป็นนักเรียน", d: "ลงนามและตราประทับโรงเรียน · 1 แผ่น", icon: "school" },
    { t: "สรุปยืนยันการชำระเงิน", d: "พร้อมรหัสธุรกรรมและช่องทางการชำระ · 1 แผ่น", icon: "check" },
  ];
  return (
    <div style={{maxWidth: 720, margin: "0 auto"}}>
      <Banner kind="info" title="ชุดเอกสารสำหรับเบิกค่าการศึกษาบุตร">
        ชุดเอกสารนี้ออกอัตโนมัติเมื่อระบบตรวจพบว่าผู้ปกครองเป็นข้าราชการที่มีสิทธิ์เบิกค่าการศึกษาบุตร ผู้ปกครองดาวน์โหลดได้จากหน้าใบเสร็จ
      </Banner>

      <div className="card" style={{marginTop: 14}}>
        <div className="card-head">
          <h3>เอกสารในชุด (รวม 5 ฉบับ)</h3>
          <button className="btn sm primary"><Icon name="download" size={11} /> ดาวน์โหลดทั้งชุด .ZIP</button>
        </div>
        <div>
          {docs.map((d, i) => (
            <div key={i} className="list-row" style={{padding: "14px 16px"}}>
              <div style={{width: 40, height: 48, background: d.emphasis ? "var(--emerald-soft)" : "var(--bg-soft)", border: "1px solid " + (d.emphasis ? "#BCDDD0" : "var(--border)"), borderRadius: 4, display: "grid", placeItems: "center", color: d.emphasis ? "var(--emerald-2)" : "var(--text-2)", flexShrink: 0, fontSize: 9, fontFamily: "var(--latin)", fontWeight: 700}}>
                <Icon name={d.icon} size={16} />
              </div>
              <div className="grow">
                <div style={{fontSize: 13.5, fontWeight: 500}}>{d.t}</div>
                <div className="tiny muted">{d.d}</div>
              </div>
              <button className="btn sm"><Icon name="eye" size={11} /> ดู</button>
              <button className="btn sm"><Icon name="download" size={11} /></button>
            </div>
          ))}
        </div>
        <div className="card-pad" style={{background: "var(--surface-2)", borderTop: "1px solid var(--border)"}}>
          <div className="flex" style={{justifyContent: "space-between"}}>
            <div className="tiny muted">รวมขนาดไฟล์: 1.4 MB · รูปแบบไฟล์ PDF/A · ผู้สร้าง SchoolPay v3.1</div>
            <div className="tiny muted">ออกโดย ครูชนัญพร · 15 พ.ค. 2569 10:14 น.</div>
          </div>
        </div>
      </div>

      <Banner kind="warn" title="ข้อควรทราบสำหรับผู้ปกครอง">
        ใบรับเงินจาก Counter Service หรือสลิปการโอนเงินไม่ใช่หลักฐานการเบิกค่าการศึกษาบุตร ต้องใช้ใบเสร็จรับเงินของโรงเรียนพร้อมชุดเอกสารฉบับนี้เท่านั้น
      </Banner>
    </div>
  );
};

const QRVerifyPreview = () => (
  <div className="card-pad" style={{display: "flex", gap: 24, alignItems: "center", justifyContent: "center", padding: 28}}>
    <QRPlaceholder size={200} seed={482} />
    <div style={{maxWidth: 320}}>
      <h3 style={{margin: "0 0 8px"}}>QR ยืนยันความถูกต้องของใบเสร็จ</h3>
      <p style={{fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0}}>
        QR ฝังอยู่ในใบเสร็จทุกฉบับ ผู้รับใบเสร็จและหน่วยงานต้นสังกัดของผู้ปกครองข้าราชการสามารถสแกนเพื่อตรวจสอบกับระบบของโรงเรียนได้ทันที
      </p>
      <div className="copy-row" style={{marginTop: 12}}>
        <span>pay.hongson.ac.th/v/R6907-00482</span>
        <span className="copy">คัดลอก</span>
      </div>
      <div className="tiny muted" style={{marginTop: 10}}>การตรวจสอบ: ผู้รับเอกสารหรือหน่วยงานต้นสังกัดสามารถสแกน QR เพื่อตรวจสอบความถูกต้องกับระบบของโรงเรียนได้โดยตรง</div>
    </div>
  </div>
);

window.AdminReceipts = AdminReceipts;
