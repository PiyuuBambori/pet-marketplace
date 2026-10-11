import { cn } from "@/lib/utils"

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-6 shadow-sm transition-shadow",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <h3 className={cn("text-xl font-semibold", className)}>{children}</h3>
}

export function CardContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("pt-2", className)}>{children}</div>
}