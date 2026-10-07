/** Icon ប្រតិទិន (SVG ក្នុងខ្លួន). ទទួល width/height/className ដូច Icons ផ្សេង */
export default function CalendarGlyph({ width = 24, height = 24, className = '', ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className={className} {...rest}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
