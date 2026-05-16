// Minimal inline icons — outline style, 16px default
const Icon = ({ name, size = 16, stroke = 1.6, color = "currentColor" }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    campaign: <><path d="M3 11l16-6v14L3 13z"/><path d="M7 13v4a2 2 0 0 0 4 0v-2"/></>,
    invoice: <><path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><path d="M9 12h7M9 16h5"/></>,
    payments: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5h1M17 14.5h1"/></>,
    recon: <><path d="M4 4l6 6-6 6"/><path d="M20 4l-6 6 6 6"/></>,
    receipt: <><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    students: <><circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/></>,
    classes: <><rect x="3" y="4" width="18" height="14" rx="1"/><path d="M3 8h18"/><path d="M8 22l1.5-4M16 22l-1.5-4"/></>,
    reports: <><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.9l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    bell: <><path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    download: <><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>,
    upload: <><path d="M12 20V8"/><path d="m7 13 5-5 5 5"/><path d="M5 4h14"/></>,
    filter: <path d="M3 5h18l-7 9v6l-4-2v-4z"/>,
    more: <><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></>,
    check: <path d="m4 12 5 5L20 6"/>,
    x: <path d="M6 6l12 12M18 6L6 18"/>,
    eye: <><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M3 3l18 18"/><path d="M10.6 6.1A11 11 0 0 1 12 6c6 0 10 6 10 6a16 16 0 0 1-2.6 3.1"/><path d="M6.6 6.6A14 14 0 0 0 2 12s4 6 10 6a10 10 0 0 0 4-.9"/><path d="M9.9 9.9a3 3 0 1 0 4.2 4.2"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
    school: <><path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11v6c0 1 2 3 5 3s5-2 5-3v-6"/><path d="M3 9v6"/></>,
    qr: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3v1M21 17v4h-4"/></>,
    barcode: <><path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M19 5v14"/></>,
    bank: <><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-4 7 4"/><path d="M6 10v9M10 10v9M14 10v9M18 10v9"/></>,
    shield: <><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></>,
    key: <><circle cx="8" cy="15" r="4"/><path d="m10.5 12 9-9"/><path d="m16 6 3 3"/><path d="m14 8 3 3"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/></>,
    alert: <><path d="M12 3 2 21h20z"/><path d="M12 10v5"/><circle cx="12" cy="18" r=".8"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 8h.01"/><path d="M11 12h1v5"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3.5 2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 5-6 8-6s7 2 8 6"/></>,
    print: <><path d="M6 9V2h12v7"/><rect x="3" y="9" width="18" height="9" rx="1"/><path d="M6 18v4h12v-4"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
    rotate: <><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></>,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6"/>,
    arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6"/>,
    chevronLeft: <path d="m15 6-6 6 6 6"/>,
    chevronRight: <path d="m9 6 6 6-6 6"/>,
    home: <><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 9h18"/></>,
    flag: <><path d="M4 4v17M4 4h13l-2 4 2 4H4"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    eyeAlt: <><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></>,
    creditCard: <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></>,
    store: <><path d="M3 7l1.5-3h15L21 7"/><path d="M3 7v3a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0V7"/><path d="M5 13v8h14v-8"/></>,
    seven: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h6l-3 10"/></>,
    chat: <><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></>,
    pencil: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></>,
    trash: <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></>,
    sparkle: <><path d="M12 3l1.7 5L19 9.7 14 12l-2 5-2-5-5-2.3 5.3-1.7z"/></>,
    receiptCheck: <><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="m9 12 2 2 4-4"/></>,
    bullet: <circle cx="12" cy="12" r="3"/>,
  };
  const p = paths[name];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
         style={{flexShrink: 0, display: "block"}}>
      {p}
    </svg>
  );
};

window.Icon = Icon;
