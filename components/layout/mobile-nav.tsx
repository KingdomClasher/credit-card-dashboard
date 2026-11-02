"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, Wallet, Calculator, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  isActive: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Catalog",
    href: "/",
    icon: CreditCard,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet,
    isActive: (pathname: string) => pathname.startsWith("/wallet"),
  },
  {
    label: "Calculator",
    href: "/calculator",
    icon: Calculator,
    isActive: (pathname: string) => pathname.startsWith("/calculator"),
  },
  {
    label: "AI Advisor",
    href: "/advisor",
    icon: Sparkles,
    isActive: (pathname: string) => pathname.startsWith("/advisor"),
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/90 pb-safe backdrop-blur-md md:hidden"
    >
      <div className="grid h-16 grid-cols-4 items-stretch px-1">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex min-h-[44px] flex-col items-center justify-center gap-1 py-1 text-center select-none transition-colors",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              {/* Active Indicator Top Pill */}
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary transition-all" />
              )}

              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-transform group-active:scale-95",
                  active && "bg-primary/10"
                )}
              >
                <Icon
                  className="size-4.5"
                  strokeWidth={active ? 2.25 : 1.75}
                />
              </div>

              <span className="text-[10px] leading-tight tracking-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
