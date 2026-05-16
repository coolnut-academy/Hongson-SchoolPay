// Admin: Reconciliation Center + Manual Review detail

const AdminReconciliation = ({ setRoute }) => {
  const [selected, setSelected] = React.useState(null);

  const invoices = [
    { id: "INV-2569-018307", name: "เด็กหญิงณิชาภา จันทรานนท์", cls: "ม.3/2", amt: 4200, due: "30 มิ.ย. 2569" },
    { id: "INV-2569-018220", name: "เด็กหญิงปุณยาพร เกษมสุข", cls: "ม.6/2", amt: 7800, due: "30 มิ.ย. 2569" },
    { id: "INV-2569-018155", name: "เด็กชายอภิรักษ์ ทองสมัย", cls: "ป.6/3", amt: 4200, due: "30 มิ.ย. 2569" },
    { id: "INV-2569-018094", name: "เด็กหญิงพิชญธิดา ลิ่มสุวรรณ", cls: "ม.1/1", amt: 4200, due: "30 มิ.ย. 2569" },
    { id: "INV-2568-099821", name: "เด็กชายปกรณ์ ศรีสกุล", cls: "ม.4/2", amt: 4200, due: "31 ม.ค. 2569", expired: true },
  ];

  const transactions = [
    { ref: "TX-KB-26051509180014", ch: "qr", ts: "15 พ.ค. 09:18", amt: 3800, ref1: "65120190026901", note: "ยอดต่ำกว่ายอดในใบแจ้ง 400 บาท", k: "mismatch", inv: "INV-2569-018307" },
    { ref: "TX-MAN-2605150004", ch: "bank", ts: "15 พ.ค. 08:54", amt: 7800, ref1: "—", note: "โอนผ่านสลิป · ไม่มี REF · ต้องจับคู่มือ", k: "unknown" },
    { ref: "TX-KTB-BRANCH-0019", ch: "ktb", ts: "11 พ.ค. 14:22", amt: 4200, ref1: "65120155026901", note: "โอนเข้าก่อนใบแจ้งหมดอายุ", k: "expired", inv: "INV-2568-099821" },
    { ref: "TX-KB-26050816220019", ch: "qr", ts: "08 พ.ค. 16:22", amt: 4200, ref1: "65120184026901", note: "ตรวจพบ TX-KB-26051509421783 มียอดเดียวกัน", k: "duplicate", inv: "INV-2569-018421" },
    { ref: "TX-SCB-26051011030081", ch: "qr", ts: "10 พ.ค. 11:03", amt: 4200, ref1: "65120094026901", note: "ตรงทุกประการ", k: "matched", inv: "INV-2569-018094" },
    { ref: "TX-BB-26050918341277", ch: "qr", ts: "09 พ.ค. 18:34", amt: 8400, ref1: "65120155026901", note: "ชำระเกินยอด 4,200 บาท", k: "overpay", inv: "INV-2569-018155" },
  ];

  const settlement = [
    { batch: "KTB-20260515", file: "ktb_statement_20260515.pdf", count: 8, amt: 38400, status: "imported" },
    { batch: "KTB-20260514", file: "ktb_statement_20260514.pdf", count: 5, amt: 24000, status: "imported" },
    { batch: "KTB-20260513", file: "ktb_statement_20260513.pdf", count: 12, amt: 50400, status: "imported" },
  ];

  const kindMeta = {
    mismatch: { label: "ยอดไม่ตรง", cls: "review" },
    unknown:  { label: "โอนไม่ทราบใบแจ้ง", cls: "danger" },
    expired:  { label: "ชำระหลังหมดอายุ", cls: "expired" },
    duplicate:{ label: "ซ้ำกับธุรกรรมเดิม", cls: "danger" },
    matched:  { label: "จับคู่อัตโนมัติ", cls: "paid" },
    overpay:  { label: "ชำระเกินยอด", cls: "overpaid" },
  };

  return (
    <>
      <Topbar crumb={["ศูนย์กระทบยอด"]} />
      <div className="content" style={{maxWidth: 1640}}>
        <div className="page-head">
          <div>
            <h1 className="page-h1">ศูนย์กระทบยอด <span style={{fontSize: 14, fontWeight: 400, color: "var(--muted)", marginLeft: 8}}>Reconciliation Center</span></h1>
            <p className="page-sub">เปรียบเทียบใบแจ้งชำระ · ธุรกรรมจาก Webhook และการยืนยัน KTB สาขา เพื่อยืนยันการรับเงินอย่างถูกต้อง</p>
          </div>
          <div className="flex">
            <button className="btn" onClick={() => handleAction("Bank Statement", "download")}><Icon name="upload" size={13} /> อัปโหลด Statement</button>
            <button className="btn" onClick={() => handleAction("การจับคู่ธุรกรรมใหม่", "save")}><Icon name="refresh" size={13} /> จับคู่ใหม่ทั้งหมด</button>
            <button className="btn primary" onClick={() => handleAction("รายงานการกระทบยอด", "export")}><Icon name="download" size={13} /> ส่งออกรายงาน</button>
          </div>
        </div>

        {/* Summary banner */}
        <div className="card card-pad" style={{marginBottom: 16, display: "flex", gap: 24, alignItems: "center"}}>
          <ReconStat label="จับคู่อัตโนมัติ" value="2,468" sub="99.6% ของธุรกรรมวันนี้" tone="emerald" icon="check" />
          <div style={{width: 1, height: 40, background: "var(--border)"}} />
          <ReconStat label="ต้องตรวจสอบ" value="18" sub="11 อยู่ในรอบปัจจุบัน" tone="danger" icon="alert" />
          <div style={{width: 1, height: 40, background: "var(--border)"}} />
          <ReconStat label="ยอดต่างจาก Settlement" value="฿0" sub="ทุกไฟล์ตรงกับยอดธนาคาร" tone="emerald" icon="check" />
          <div style={{width: 1, height: 40, background: "var(--border)"}} />
          <ReconStat label="จับคู่ล่าสุด" value="1 นาทีที่แล้ว" sub="ตั้งให้ทำทุก 5 นาที" icon="clock" />
          <div className="grow" />
          <div style={{textAlign: "right"}}>
            <div className="tiny muted">งวด</div>
            <div style={{fontSize: 14, fontWeight: 600}}>1 – 15 พ.ค. 2569</div>
          </div>
        </div>

        <div className="card">
          <div className="filters">
            <div className="filter"><Icon name="calendar" size={12} /> วันที่: <b>1–15 พ.ค. 2569</b></div>
            <div className="filter">รอบเก็บเงิน: <b>CMP-2569-01</b></div>
            <div className="filter">ช่องทาง: <b>ทั้งหมด</b></div>
            <div className="filter">ผู้ให้บริการ: <b>ทั้งหมด</b></div>
            <div className="filter">สถานะ: <b>ต้องตรวจสอบ</b> <span className="x">×</span></div>
            <div className="filter">ยอดเงิน: <b>ทั้งหมด</b></div>
          </div>

          {/* 3-panel layout */}
          <div className="recon-grid" style={{padding: 12}}>
            {/* Panel 1: invoices */}
            <div className="recon-panel">
              <PanelHead title="ใบแจ้งชำระจากระบบ" count={`${invoices.length} ใบที่ยังไม่กระทบยอด`} icon="invoice" />
              <div style={{maxHeight: 540, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6}}>
                {invoices.map((iv, i) => (
                  <div key={i} className="list-row" style={{padding: "12px 14px", borderBottom: i < invoices.length - 1 ? "1px solid var(--border)" : "none"}}>
                    <div className="avatar-sm" style={{background: iv.expired ? "var(--bg-soft)" : "var(--navy-soft)", color: iv.expired ? "var(--muted)" : "var(--navy)"}}>
                      <Icon name="invoice" size={13} />
                    </div>
                    <div className="grow" style={{minWidth: 0}}>
                      <div style={{fontSize: 12.5, fontWeight: 500}}>{iv.name}</div>
                      <div className="tiny muted">
                        <span className="mono">{iv.id}</span> · {iv.cls} · กำหนด {iv.due}
                      </div>
                    </div>
                    <div className="r">
                      <div style={{fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500}}>{fmt(iv.amt)}</div>
                      {iv.expired && <div className="tiny" style={{color: "var(--danger)"}}>หมดอายุ</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: transactions */}
            <div className="recon-panel">
              <PanelHead title="ธุรกรรมจากผู้ให้บริการ" count={`${transactions.length} รายการ · กล่องกลาง`} icon="payments" highlight />
              <div style={{maxHeight: 540, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6}}>
                {transactions.map((t, i) => {
                  const meta = kindMeta[t.k];
                  return (
                    <div key={i}
                         className="list-row"
                         onClick={() => setSelected(t)}
                         style={{padding: "12px 14px", borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", background: selected?.ref === t.ref ? "var(--navy-soft)" : "transparent"}}>
                      <div className="avatar-sm" style={{background: t.k === "matched" ? "var(--emerald-soft)" : "var(--gold-soft)", color: t.k === "matched" ? "var(--emerald-2)" : "var(--gold-2)"}}>
                        <Icon name={t.ch === "qr" ? "qr" : t.ch === "cs" ? "store" : "bank"} size={13} />
                      </div>
                      <div className="grow" style={{minWidth: 0}}>
                        <div className="mono" style={{fontSize: 11.5}}>{t.ref}</div>
                        <div className="tiny" style={{marginTop: 2}}>
                          <span className={"badge " + meta.cls} style={{fontSize: 10.5, padding: "1px 6px"}}>{meta.label}</span>
                          <span className="muted" style={{marginLeft: 6}}>{t.ts}</span>
                        </div>
                      </div>
                      <div className="r">
                        <div style={{fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500}}>{fmt(t.amt)}</div>
                        <div className="tiny muted">{t.ch.toUpperCase()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel 3: settlement batches */}
            <div className="recon-panel">
              <PanelHead title="Bank Statement · KTB สาขา" count="3 ไฟล์ในรอบ" icon="bank" />
              <div style={{border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden"}}>
                {settlement.map((s, i) => (
                  <div key={i} style={{padding: "12px 14px", borderBottom: i < settlement.length - 1 ? "1px solid var(--border)" : "none"}}>
                    <div className="flex" style={{justifyContent: "space-between", marginBottom: 4}}>
                      <span className="mono" style={{fontSize: 11.5, fontWeight: 600}}>{s.batch}</span>
                      <Badge status={s.status === "imported" ? "paid" : "pending"} label={s.status === "imported" ? "นำเข้าแล้ว" : "กำลังตรวจ"} />
                    </div>
                    <div className="tiny muted mono" style={{marginBottom: 6}}>{s.file}</div>
                    <div className="flex" style={{justifyContent: "space-between", fontSize: 12.5}}>
                      <span className="muted">{s.count} รายการ</span>
                      <span className="mono" style={{fontWeight: 500}}>฿{fmt(s.amt, 0)}</span>
                    </div>
                  </div>
                ))}
                <div style={{padding: "10px 14px", textAlign: "center", background: "var(--surface-2)"}}>
                  <button className="btn sm ghost" style={{color: "var(--info)"}} onClick={() => handleAction("เพิ่มไฟล์ Bank Statement", "download")}><Icon name="upload" size={11} /> เพิ่มไฟล์ Bank Statement</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected transaction = Manual review detail */}
        {selected && <ManualReviewDetail tx={selected} onClose={() => setSelected(null)} />}
        {!selected && <DefaultManualReviewHint />}
      </div>
    </>
  );
};

const PanelHead = ({ title, count, icon, highlight }) => (
  <div className="flex" style={{marginBottom: 8, padding: "4px 2px"}}>
    <Icon name={icon} size={14} color={highlight ? "var(--gold-2)" : "var(--text-2)"} />
    <span style={{fontSize: 13, fontWeight: 600}}>{title}</span>
    <span className="tiny muted">· {count}</span>
    {highlight && <span className="badge gold" style={{marginLeft: "auto"}}><span className="dot" />ต้องดำเนินการ</span>}
  </div>
);

const ReconStat = ({ label, value, sub, tone, icon }) => {
  const c = tone === "emerald" ? "var(--emerald-2)" : tone === "danger" ? "var(--danger)" : "var(--text)";
  const bg = tone === "emerald" ? "var(--emerald-soft)" : tone === "danger" ? "var(--danger-soft)" : "var(--bg-soft)";
  return (
    <div className="flex" style={{gap: 12}}>
      <div style={{width: 36, height: 36, borderRadius: 8, background: bg, color: c, display: "grid", placeItems: "center"}}>
        <Icon name={icon} size={16} />
      </div>
      <div>
        <div className="tiny muted">{label}</div>
        <div className="latin" style={{fontSize: 20, fontWeight: 600, color: c, letterSpacing: "-0.01em"}}>{value}</div>
        <div className="tiny muted">{sub}</div>
      </div>
    </div>
  );
};

const DefaultManualReviewHint = () => (
  <div className="card card-pad" style={{marginTop: 16, textAlign: "center", padding: 36, background: "var(--surface-2)"}}>
    <div className="muted">เลือกรายการธุรกรรมจากแผงตรงกลาง เพื่อดูรายละเอียดและการตรวจสอบ</div>
  </div>
);

const ManualReviewDetail = ({ tx, onClose }) => {
  const isMatched = tx.k === "matched";
  const kindBlurb = {
    mismatch: "ยอดที่โอนจริงต่ำกว่ายอดในใบแจ้งชำระ ระบบ Auto-Match ปฏิเสธโดยอัตโนมัติ ต้องตัดสินใจว่าจะรับเป็น Partial Payment หรือคืนเงินให้ผู้ปกครอง",
    unknown:  "ระบบไม่พบใบแจ้งที่ตรงกับ REF1/REF2 ของธุรกรรมนี้ อาจเป็นการโอนตรงโดยไม่ผ่าน QR ที่ระบบสร้าง",
    expired:  "ผู้ปกครองโอนเข้าในบัญชี KTB หลังจากใบแจ้งหมดอายุไปแล้ว สามารถยืนยันด้วยมือหรือออกใบแจ้งใหม่ตามนโยบายโรงเรียน",
    duplicate:"มีการชำระเข้ามาสองครั้งภายในวันเดียวกันสำหรับใบแจ้งเดียว ระบบเลือกยึดธุรกรรมแรกและเก็บอันที่สองไว้รอตรวจสอบ",
    matched:  "จับคู่อัตโนมัติเรียบร้อย ทั้ง REF1, REF2, ยอด, และรหัสนักเรียนตรงทุกประการ",
    overpay:  "ผู้ปกครองชำระเกินยอดในใบแจ้งชำระ 4,200 บาท ต้องตรวจสอบกับนโยบายโรงเรียนว่าจะนำส่วนเกินมาตัดยอดงวดถัดไปหรือคืนเงิน",
  };

  return (
    <div className="card" style={{marginTop: 16}}>
      <div className="card-head">
        <div>
          <h3 style={{display: "flex", alignItems: "center", gap: 10}}>
            <span className="mono">{tx.ref}</span>
            <span className="badge review"><span className="dot" />{tx.note.split("·")[0]}</span>
          </h3>
          <div className="tiny muted">รายการที่ต้องตรวจสอบ · ระบบหยุดยืนยันอัตโนมัติจนกว่าเจ้าหน้าที่จะดำเนินการ</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" /></button>
      </div>

      <div style={{padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16}}>
        {/* Transaction info */}
        <div>
          <div className="section-h">รายละเอียดธุรกรรม</div>
          <KVCompact k="รหัสธุรกรรม" v={tx.ref} mono />
          <KVCompact k="ช่องทาง" v={tx.ch === "qr" ? "Mobile Banking QR" : "KTB สาขา (เจ้าหน้าที่)"} />
          <KVCompact k="เวลา" v={tx.ts} />
          <KVCompact k="ยอดที่โอนเข้า" v={"฿" + fmt(tx.amt)} bold />
          <KVCompact k="REF1 จากธุรกรรม" v={tx.ref1} mono />
          <KVCompact k="ผู้ให้บริการ" v="Krungthai Bank" />
        </div>

        {/* Invoice match */}
        <div>
          <div className="section-h">ใบแจ้งชำระที่จับคู่</div>
          {tx.inv ? (
            <>
              <KVCompact k="เลขที่ใบแจ้ง" v={tx.inv} mono />
              <KVCompact k="นักเรียน" v="ตามใบแจ้งชำระ" />
              <KVCompact k="ยอดในใบแจ้ง" v={"฿4,200.00"} />
              <KVCompact k="ส่วนต่าง" v={"฿" + fmt(tx.amt - 4200)} danger={tx.amt !== 4200} />
              <KVCompact k="กำหนดชำระ" v="30 มิ.ย. 2569" />
            </>
          ) : (
            <div className="card-pad" style={{background: "var(--surface-2)", borderRadius: 6, textAlign: "center"}}>
              <div className="muted tiny" style={{padding: 10}}>ไม่พบใบแจ้งชำระที่ตรงกับ REF1/REF2 ของธุรกรรมนี้</div>
              <button className="btn sm primary" style={{marginTop: 4}}><Icon name="search" size={11} /> ค้นหาใบแจ้งด้วยตนเอง</button>
            </div>
          )}
        </div>

        {/* Action panel */}
        <div>
          <div className="section-h">การดำเนินการ</div>
          {!isMatched && (
            <Banner kind="warn">
              <b>คำเตือน:</b> การยืนยันการชำระจะทำให้ระบบออกใบเสร็จและบันทึก Audit Log การกระทำนี้ไม่สามารถย้อนกลับโดยตรง ใช้ Void/Reissue เท่านั้น
            </Banner>
          )}
          <div className="flex-col" style={{gap: 8, marginTop: 12}}>
            <button className="btn emerald" style={{justifyContent: "center"}} onClick={() => handleAction("การจับคู่และยืนยันยอด", "save")}><Icon name="check" size={13} /> ยืนยันจับคู่ &amp; ยอมรับยอด</button>
            <button className="btn" style={{justifyContent: "center"}} onClick={() => handleAction("การเปลี่ยนใบแจ้งที่จับคู่", "save")}><Icon name="link" size={13} /> เปลี่ยนใบแจ้งที่จับคู่</button>
            <button className="btn" style={{justifyContent: "center"}} onClick={() => handleAction("การรับชำระบางส่วน", "save")}><Icon name="receipt" size={13} /> รับเป็นชำระบางส่วน (Partial)</button>
            <button className="btn" style={{justifyContent: "center"}} onClick={() => handleAction("การทำเครื่องหมายธุรกรรมซ้ำ", "save")}><Icon name="refresh" size={13} /> ทำเครื่องหมายเป็นซ้ำ</button>
            <button className="btn danger" style={{justifyContent: "center"}} onClick={() => handleAction("การส่งคืน/คืนเงิน", "save")}><Icon name="x" size={13} /> ส่งคืน / คืนเงินผู้ปกครอง</button>
          </div>
        </div>
      </div>

      <div style={{padding: "12px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-2)"}}>
        <div className="section-h" style={{marginBottom: 8}}>ความเห็นและบันทึก</div>
        <div className="flex" style={{alignItems: "flex-start", gap: 10}}>
          <Avatar name="ครูชนัญพร" size={26} />
          <textarea className="textarea" rows="2" placeholder="บันทึกเหตุผลในการตัดสินใจ ผลของการกระทำนี้จะถูกเก็บใน Audit Log..." style={{flex: 1}}></textarea>
          <button className="btn primary">บันทึกความเห็น</button>
        </div>
        <div className="tiny muted" style={{marginTop: 10}}>
          <Icon name="info" size={11} /> {kindBlurb[tx.k]}
        </div>
      </div>
    </div>
  );
};

const KVCompact = ({ k, v, mono, bold, danger }) => (
  <div style={{display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)", gap: 10, fontSize: 12.5}}>
    <span className="muted">{k}</span>
    <span className={mono ? "mono" : ""} style={{textAlign: "right", fontWeight: bold ? 600 : 400, color: danger ? "var(--danger)" : "inherit"}}>{v}</span>
  </div>
);

window.AdminReconciliation = AdminReconciliation;
