import type { SVGProps } from 'react'

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} satisfies SVGProps<SVGSVGElement>

export function GripIcon() {
  return (
    <svg {...iconProps} stroke="none" fill="currentColor">
      <circle cx="6" cy="4" r="1.25" />
      <circle cx="10" cy="4" r="1.25" />
      <circle cx="6" cy="8" r="1.25" />
      <circle cx="10" cy="8" r="1.25" />
      <circle cx="6" cy="12" r="1.25" />
      <circle cx="10" cy="12" r="1.25" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

export function ResizeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M13 6l-7 7M13 10l-3 3" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg {...iconProps} width={20} height={20}>
      <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.75 9.5h6.5L12 4M6.75 6.5v4.5M9.25 6.5v4.5" />
    </svg>
  )
}
