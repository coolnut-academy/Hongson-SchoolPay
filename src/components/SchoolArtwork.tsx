/** Decorative open-book engraving. It contains no financial or student data. */
export function SchoolArtwork() {
  return <svg className="school-artwork" viewBox="0 0 240 180" fill="none" aria-hidden>
    <defs>
      <linearGradient id="book-ink" x1="35" y1="20" x2="200" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#b3d8be" /><stop offset=".5" stopColor="#438a6c" /><stop offset="1" stopColor="#153d38" /></linearGradient>
      <radialGradient id="book-light"><stop stopColor="#d9e8d8" /><stop offset="1" stopColor="#f5f7f4" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="120" cy="95" rx="115" ry="82" fill="url(#book-light)" />
    <g stroke="url(#book-ink)" strokeWidth="1.2" strokeLinejoin="round">
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${34 + i * 2} ${38 + i * 5} Q80 ${19 + i * 5} 120 ${58 + i * 5} Q160 ${19 + i * 5} ${206 - i * 2} ${38 + i * 5} L${206 - i * 2} ${66 + i * 5} Q160 ${47 + i * 5} 120 ${86 + i * 5} Q80 ${47 + i * 5} ${34 + i * 2} ${66 + i * 5} Z`} />)}
    </g>
    <path d="M120 58v84" stroke="#315d48" strokeWidth="1.5" />
  </svg>;
}
