import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-card text-card-foreground rounded-xl border border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}