'use client'

export function SCurvePulse() {
  // S-curve path traced to match the pipe layout in the base plate image:
  // Row 1: left→right (Stage 1 → 2 → 3)
  // Curve down-right to Row 2: right→left (Stage 3 → 4 → 5)
  // Curve down-left to Row 3: left→right (Stage 5 → 6 → 7)
  const pathD = `
    M 15,20
    C 18,18 28,15 42,15
    L 55,15
    C 65,15 72,15 78,18
    C 84,22 88,30 85,40
    C 82,48 75,52 68,52
    L 50,52
    C 40,52 32,52 28,55
    C 22,60 18,68 22,76
    C 26,82 32,85 40,85
    L 58,85
    C 65,85 72,84 76,82
  `

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
    >
      {/* Dim ambient path glow */}
      <path
        d={pathD}
        stroke="rgba(34, 211, 238, 0.08)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Animated orb traveling the path */}
      <circle r="0.8" fill="#22D3EE" className="pulse-orb-glow">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path={pathD}
        />
      </circle>

      {/* Orb outer glow */}
      <circle r="1.5" fill="rgba(34, 211, 238, 0.3)">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path={pathD}
        />
      </circle>

      {/* Trailing comet effect - slightly delayed */}
      <circle r="0.5" fill="rgba(34, 211, 238, 0.5)">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path={pathD}
          begin="-0.15s"
        />
      </circle>
      <circle r="0.3" fill="rgba(34, 211, 238, 0.25)">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path={pathD}
          begin="-0.3s"
        />
      </circle>
    </svg>
  )
}
