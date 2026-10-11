import { cn } from "@/lib/utils"

const variants = {
  default: "bg-black text-white hover:bg-gray-800",
  outline: "border border-black text-black hover:bg-black hover:text-white",
  ghost: "hover:bg-gray-100",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
}

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}