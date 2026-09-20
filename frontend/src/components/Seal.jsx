/**
 * What changed: Seal ring is teal now, not gold.
 * Why: Gold is reserved for the header line, selected card, and letterhead rule.
 * Related: src/components/AppShell.jsx, src/pages/Login.jsx
 */
export function Seal({ tone = 'ink', size = 36 }) {
  const ring = '#1A4544'
  const fill = tone === 'light' ? '#F6F3EC' : '#1A4544'
  const letter = tone === 'light' ? '#1A4544' : '#F6F3EC'

  return (
    <svg
      className="seal"
      width={size}
      height={size}
      viewBox="0 0 36 36"
      aria-hidden="true"
    >
      <rect x="1.2" y="1.2" width="33.6" height="33.6" rx="3" fill="none" stroke={ring} strokeWidth="1.1" />
      <rect x="4.4" y="4.4" width="27.2" height="27.2" rx="1.5" fill={fill} />
      <path
        d="M11 25V11h4.4c2.5 0 4 1.2 4 3.3 0 1.3-.7 2.3-1.9 2.8 1.3.5 2.2 1.6 2.2 3.2 0 2.2-1.7 3.7-4.4 3.7H11zm3.1-6.6h1.1c1.1 0 1.7-.5 1.7-1.4s-.6-1.4-1.7-1.4h-1.1v2.8zm0 5h1.4c1.2 0 2-.6 2-1.6s-.8-1.6-2-1.6h-1.4V23.4z"
        fill={letter}
      />
    </svg>
  )
}
