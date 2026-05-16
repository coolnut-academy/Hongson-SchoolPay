// Finance Dashboard
const AdminDashboard = ({ setRoute }) => {
  const monthBars = [
    { m: "พ.ค.", paid: 62, pending: 8 },
    { m: "มิ.ย.", paid: 75, pending: 20 },
    { m: "ก.ค.", paid: 52, pending: 16 },
    { m: "ส.ค.", paid: 88, pending: 18 },
    { m: "ก.ย.", paid: 72, pending: 12 },
    { m: "ต.ค.", paid: 95, pending: 22 },
    { m: "พ.ย.", paid: 80, pending: 30 },
    { m: "ธ.ค.", paid: 92, pending: 15 },
  ];

  const activity = [
    { t: "08:42", who: "ระบบ", text: "ยืนยันการชำระอัตโนมัติจาก KrungThai Webhook · ใบแจ้งชำระ INV-2569-018421", amount: 4200, status: "paid" },
    { t: "08:31", who: "ระบบ", text: "ยืนยันการชำระอัตโนมัติ QR PromptPay · INV-2569-018407 · 4,200.00 บาท", amount: 4200, status: "paid" },
    { t: "08:14", who: "ครูชนัญพร", text: "ออกใบเสร็จเลขที่ R6907-00482 ให้นักเรียน เด็กชายภาคิน วงศ์อิสรกุล", amount: 7800, status: "receipt_issued" },
    { t: "08:02", who: "ระบบ", text: "ตรวจพบยอดไม่ตรง · INV-2569-018307 โอน 3,800.00 จากยอด 4,200.00", amount: 3800, status: "under_review" },
    { t: "07:55", who: "ระบบ", text: "ปิดใบแจ้งชำระอัตโนมัติ (เกินกำหนด) · 12 รายการ", amount: 0, status: "expired" },
    { t: "07:48", who: "ครูชนัญพร", text: "ยืนยันการชำระ KTB สาขา · INV-2569-018220 · ตรวจสลิปแล้ว", amount: 7800, status: "paid" },
  ];

  return (
    <>
      <Topbar
        crumb={["Dashboard", "ภาพรวมการเงิน ปีการศึกษา 2569"]}
        rightSlot={
          <button className="btn primary"><Icon name="plus" size={14} />สร้างรอบเก็บเงิน</button>
        }
      />
      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-h1">ภาพรวมการเงินโรงเรียน</h1>
            <p className="page-sub">โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ · ภาคเรียนที่ 1 ปีการศึกษา 2569 · ข้อมูล ณ 15 พ.ค. 2569 เวลา 09:42 น.</p>
          </div>
          <div className="flex">
            <div className="btn-group">
              <button className="btn">วันนี้</button>
              <button className="btn primary">ภาคเรียนนี้</button>
              <button className="btn">ปีการศึกษานี้</button>
            </div>
            <button className="btn" onClick={() => handleAction("รายงานภาพรวมการเงิน", "export")}><Icon name="download" size={13} />ส่งออก</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpis">
          <div className="kpi accent-navy">
            <div className="kpi-label">ยอดที่ต้องเก็บทั้งหมด</div>
            <div className="kpi-value">฿14,820,400<span className="suffix">.00</span></div>
            <div className="kpi-delta">2,184 ใบแจ้งชำระ · ครอบคลุม 1,742 นักเรียน</div>
          </div>
          <div className="kpi accent-emerald">
            <div className="kpi-label">เก็บได้แล้ว</div>
            <div className="kpi-value">฿10,664,820<span className="suffix">.00</span></div>
            <div className="kpi-bar"><div className="fill" style={{width: "71.9%"}} /></div>
            <div className="kpi-delta up">71.9% ของยอดทั้งหมด · 1,253 ราย</div>
          </div>
          <div className="kpi accent-gold">
            <div className="kpi-label">คงค้าง</div>
            <div className="kpi-value">฿4,155,580<span className="suffix">.00</span></div>
            <div className="kpi-delta">489 ราย · 312 เกินกำหนด 7 วัน</div>
          </div>
          <div className="kpi accent-danger">
            <div className="kpi-label">รายการต้องตรวจสอบ</div>
            <div className="kpi-value">18</div>
            <div className="kpi-delta down">↑ 6 จากเมื่อวาน · ต้องดำเนินการภายในวันนี้</div>
          </div>
        </div>

        {/* Second row of smaller KPIs */}
        <div className="kpis" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
          <div className="kpi">
            <div className="kpi-label"><Icon name="receipt" size={13} color="#5C6878" /> ใบเสร็จรอออก</div>
            <div className="kpi-value" style={{fontSize: 20}}>74</div>
            <div className="kpi-delta">42 รอเจ้าหน้าที่อนุมัติ</div>
          </div>
          <div className="kpi">
            <div className="kpi-label"><Icon name="bank" size={13} color="#5C6878" /> KTB สาขา · รอยืนยันวันนี้</div>
            <div className="kpi-value" style={{fontSize: 20}}>8</div>
            <div className="kpi-delta">สลิปรอเจ้าหน้าที่ตรวจสอบ</div>
          </div>
          <div className="kpi">
            <div className="kpi-label"><Icon name="recon" size={13} color="#5C6878" /> Webhook สำเร็จ 24 ชม.</div>
            <div className="kpi-value" style={{fontSize: 20}}>2,486 <span className="suffix">/ 2,491</span></div>
            <div className="kpi-delta">99.8% · ล่าสุด 1 นาทีที่แล้ว</div>
          </div>
          <div className="kpi">
            <div className="kpi-label"><Icon name="students" size={13} color="#5C6878" /> นักเรียนที่ยังไม่ชำระ</div>
            <div className="kpi-value" style={{fontSize: 20}}>489 <span className="suffix">/ 1,742</span></div>
            <div className="kpi-delta">28% · ม.6/2 ค้างมากสุด 34 ราย</div>
          </div>
        </div>

        <div className="grid-2" style={{marginTop: 16}}>
          {/* Charts */}
          <div className="card">
            <div className="card-head">
              <h3>ยอดเก็บรายเดือน · ปีการศึกษา 2569</h3>
              <div className="flex" style={{fontSize: 12}}>
                <span className="legend-item"><span className="legend-sw" style={{background: "var(--emerald)"}} /> ชำระแล้ว</span>
                <span className="legend-item"><span className="legend-sw" style={{background: "var(--info-soft)", border: "1px dashed var(--info)"}} /> รอชำระ</span>
              </div>
            </div>
            <div className="chart-area">
              <div className="bars">
                {monthBars.map((b, i) => (
                  <div className="bar-group" key={i}>
                    <div className="bar-stack">
                      <div className="bar pending" style={{height: b.pending + "%"}} />
                      <div className="bar paid" style={{height: b.paid + "%"}} />
                    </div>
                    <div className="label">{b.m}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>การกระจายช่องทางชำระ</h3></div>
            <div className="card-pad" style={{display: "flex", gap: 24, alignItems: "center", justifyContent: "center"}}>
              <div className="donut">
                <div className="donut-center">
                  <div>
                    <div className="donut-pct">71.9%</div>
                    <div className="donut-label">ชำระแล้ว</div>
                  </div>
                </div>
              </div>
              <div className="legend">
                <div className="legend-item"><span className="legend-sw" style={{background: "var(--emerald)"}} /> Mobile Banking QR · 88%</div>
                <div className="legend-item"><span className="legend-sw" style={{background: "var(--info-soft)"}} /> KTB สาขา · 8%</div>
                <div className="legend-item"><span className="legend-sw" style={{background: "var(--danger-soft)"}} /> รอตรวจสอบ · 4%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{marginTop: 16}}>
          {/* Activity */}
          <div className="card">
            <div className="card-head">
              <h3>กิจกรรมล่าสุด</h3>
              <span className="link" onClick={() => setRoute("audit")}>ดูทั้งหมด →</span>
            </div>
            <div>
              {activity.map((a, i) => (
                <div className="list-row" key={i}>
                  <div className="avatar-sm" style={{background: "transparent"}}>{a.who === "ระบบ" ? <img src="assets/logo.png" alt="S" style={{width: "100%", height: "100%", borderRadius: "50%"}} /> : a.who.split("")[0]}</div>
                  <div className="grow" style={{minWidth: 0}}>
                    <div style={{fontSize: 13}}>{a.text}</div>
                    <div className="tiny muted" style={{marginTop: 2}}>
                      <span className="latin">{a.t}</span> · {a.who}
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions / pending */}
          <div className="flex-col" style={{gap: 12}}>
            <div className="card">
              <div className="card-head">
                <h3>ต้องดำเนินการ</h3>
                <span className="link">ดูทั้งหมด</span>
              </div>
              <div>
                <div className="list-row" onClick={() => setRoute("reconciliation")} style={{cursor: "pointer"}}>
                  <div style={{width: 30, height: 30, borderRadius: 8, background: "var(--danger-soft)", color: "var(--danger)", display: "grid", placeItems: "center"}}>
                    <Icon name="alert" size={14} />
                  </div>
                  <div className="grow">
                    <div style={{fontSize: 13, fontWeight: 500}}>18 ธุรกรรมต้องตรวจสอบ</div>
                    <div className="tiny muted">ยอดไม่ตรง 9 · REF ไม่รู้จัก 5 · ใบแจ้งหมดอายุ 4</div>
                  </div>
                  <Icon name="chevronRight" size={14} color="#5C6878" />
                </div>
                <div className="list-row" onClick={() => setRoute("receipts")} style={{cursor: "pointer"}}>
                  <div style={{width: 30, height: 30, borderRadius: 8, background: "var(--gold-soft)", color: "var(--gold-2)", display: "grid", placeItems: "center"}}>
                    <Icon name="receipt" size={14} />
                  </div>
                  <div className="grow">
                    <div style={{fontSize: 13, fontWeight: 500}}>42 ใบเสร็จรอเจ้าหน้าที่อนุมัติ</div>
                    <div className="tiny muted">ในจำนวนนี้ 12 เป็นใบเสร็จเบิกค่าการศึกษาบุตร</div>
                  </div>
                  <Icon name="chevronRight" size={14} color="#5C6878" />
                </div>
                <div className="list-row" style={{cursor: "pointer"}}>
                  <div style={{width: 30, height: 30, borderRadius: 8, background: "var(--info-soft)", color: "var(--info)", display: "grid", placeItems: "center"}}>
                    <Icon name="bank" size={14} />
                  </div>
                  <div className="grow">
                    <div style={{fontSize: 13, fontWeight: 500}}>ยืนยันการชำระ KTB สาขา 8 รายการ</div>
                    <div className="tiny muted">มีสลิปรอตรวจสอบ · กดเพื่อเปิด Reconciliation</div>
                  </div>
                  <Icon name="chevronRight" size={14} color="#5C6878" />
                </div>
                <div className="list-row" style={{cursor: "pointer"}}>
                  <div style={{width: 30, height: 30, borderRadius: 8, background: "var(--navy-soft)", color: "var(--navy)", display: "grid", placeItems: "center"}}>
                    <Icon name="chat" size={14} />
                  </div>
                  <div className="grow">
                    <div style={{fontSize: 13, fontWeight: 500}}>ส่งเตือนผู้ปกครอง 312 ราย</div>
                    <div className="tiny muted">ยังไม่ชำระและเหลือ ≤ 3 วันก่อนหมดเขต</div>
                  </div>
                  <Icon name="chevronRight" size={14} color="#5C6878" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>รอบเก็บเงินที่กำลังดำเนินการ</h3></div>
              <div className="card-pad">
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8}}>
                  <div>
                    <div style={{fontSize: 13, fontWeight: 600}}>ค่าบำรุงการศึกษา ภาคเรียนที่ 1/2569</div>
                    <div className="tiny muted">CMP-2569-01 · ปิดรับชำระ 30 มิ.ย. 2569</div>
                  </div>
                  <Badge status="active" label="กำลังเปิดรับ" />
                </div>
                <div className="progress">
                  <div className="seg-paid" style={{width: "71.9%"}} />
                  <div className="seg-pending" style={{width: "16.4%"}} />
                  <div className="seg-review" style={{width: "1.1%"}} />
                </div>
                <div className="tiny muted" style={{marginTop: 6, display: "flex", justifyContent: "space-between"}}>
                  <span>1,253 / 1,742 ราย</span>
                  <span className="latin">฿10,664,820 / ฿14,820,400</span>
                </div>

                <div className="divider" />

                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8}}>
                  <div>
                    <div style={{fontSize: 13, fontWeight: 600}}>ค่ากิจกรรมพัฒนาผู้เรียน 1/2569</div>
                    <div className="tiny muted">CMP-2569-02 · ปิดรับชำระ 15 ก.ค. 2569</div>
                  </div>
                  <Badge status="active" label="กำลังเปิดรับ" />
                </div>
                <div className="progress">
                  <div className="seg-paid" style={{width: "42.1%"}} />
                  <div className="seg-pending" style={{width: "30%"}} />
                </div>
                <div className="tiny muted" style={{marginTop: 6, display: "flex", justifyContent: "space-between"}}>
                  <span>734 / 1,742 ราย</span>
                  <span className="latin">฿881,200 / ฿2,090,400</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

window.AdminDashboard = AdminDashboard;
