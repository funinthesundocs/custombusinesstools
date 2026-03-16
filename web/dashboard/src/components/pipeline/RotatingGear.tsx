'use client'

interface RotatingGearProps {
  src: string
  /** Position relative to parent container, as percentages */
  left: string
  top: string
  /** Size as percentage of parent width */
  size: string
  /** Animation duration in seconds */
  duration?: number
  /** Rotation direction */
  direction?: 'clockwise' | 'counterclockwise'
  /** Z-index for layering */
  zIndex?: number
}

export function RotatingGear({
  src,
  left,
  top,
  size,
  duration = 10,
  direction = 'clockwise',
  zIndex = 15,
}: RotatingGearProps) {
  const animationName = direction === 'clockwise' ? 'spin-cw' : 'spin-ccw'

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left,
        top,
        width: size,
        height: size,
        zIndex,
        transform: 'translate(-50%, -50%)', // center on the position point
      }}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        style={{
          borderRadius: '50%',
          animation: `${animationName} ${duration}s linear infinite`,
        }}
        draggable={false}
      />
    </div>
  )
}
