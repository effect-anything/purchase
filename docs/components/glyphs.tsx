import type { SVGProps } from "react"

const baseProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  role: "presentation",
  "aria-hidden": true,
  fill: "none",
  className: "purchase-section-glyph"
} as const

type Props = Omit<SVGProps<SVGSVGElement>, "fill" | "viewBox" | "width" | "height">

const stroke = "currentColor"

export function GlyphConcentric(props: Props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9.5" stroke={stroke} strokeOpacity="0.35" />
      <circle cx="12" cy="12" r="5.5" stroke={stroke} strokeOpacity="0.6" />
      <circle cx="12" cy="12" r="1.75" fill="var(--docs-color-spark)" />
    </svg>
  )
}

export function GlyphSplit(props: Props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="7" cy="12" r="4.5" stroke={stroke} strokeOpacity="0.6" />
      <circle cx="17" cy="12" r="4.5" stroke={stroke} strokeOpacity="0.6" />
      <circle cx="12" cy="12" r="1.5" fill="var(--docs-color-spark)" />
    </svg>
  )
}

export function GlyphTerminal(props: Props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="14" stroke={stroke} strokeOpacity="0.5" />
      <path d="M6.5 10.5l2.5 2-2.5 2" stroke={stroke} strokeOpacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 15.5h6" stroke={stroke} strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  )
}

export function GlyphGrid(props: Props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" stroke={stroke} strokeOpacity="0.6" />
      <rect x="13.5" y="3.5" width="7" height="7" stroke={stroke} strokeOpacity="0.35" />
      <rect x="3.5" y="13.5" width="7" height="7" stroke={stroke} strokeOpacity="0.35" />
      <rect x="13.5" y="13.5" width="7" height="7" fill="var(--docs-color-spark)" stroke="none" />
    </svg>
  )
}

export function GlyphArrow(props: Props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 12h14" stroke={stroke} strokeOpacity="0.7" strokeLinecap="round" />
      <path d="M13 7l5 5-5 5" stroke={stroke} strokeOpacity="0.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="12" r="1.5" fill="var(--docs-color-spark)" />
    </svg>
  )
}

export function GlyphLayers(props: Props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 4l8 4-8 4-8-4 8-4z" stroke={stroke} strokeOpacity="0.85" strokeLinejoin="round" />
      <path d="M4 12l8 4 8-4" stroke={stroke} strokeOpacity="0.45" strokeLinejoin="round" />
      <path d="M4 16l8 4 8-4" stroke={stroke} strokeOpacity="0.25" strokeLinejoin="round" />
    </svg>
  )
}
