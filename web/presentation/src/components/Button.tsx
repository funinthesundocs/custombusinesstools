import Link from 'next/link'

interface ButtonProps {
  href: string
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  className?: string
}

export function Button({ href, variant = 'primary', children, className = '' }: ButtonProps) {
  const base = 'inline-block px-8 py-3 rounded-lg font-semibold text-[15px] transition-all duration-200'
  const styles = variant === 'primary'
    ? 'bg-brand-navy text-white hover:bg-opacity-90'
    : 'border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  )
}
