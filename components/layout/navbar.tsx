"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  CreditCard,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  Calculator,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const subscribe = () => () => {}

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const pathname = usePathname()
  const isCatalog = pathname === "/"
  const isCalculator = pathname.startsWith("/calculator")
  const isWallet = pathname.startsWith("/wallet")

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CreditCard className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-bold tracking-tight text-foreground">
                  Credit Card Dashboard
                </span>
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 py-0 text-[10px] font-normal"
                >
                  Pro
                </Badge>
              </div>
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                Discovery & Reward Optimization
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
              isCatalog
                ? "bg-secondary/80 font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Sparkles
              className={cn(
                "size-3.5",
                isCatalog ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span>Catalog</span>
            <span className="py-0.2 ml-1 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
              33
            </span>
          </Link>
          <Link
            href="/calculator"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
              isCalculator
                ? "bg-secondary/80 font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Calculator
              className={cn(
                "size-3.5",
                isCalculator ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span>Calculator</span>
            <span className="py-0.2 rounded bg-primary/10 px-1.5 text-[9px] font-bold tracking-wider text-primary uppercase">
              Live
            </span>
          </Link>
          <Link
            href="/wallet"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
              isWallet
                ? "bg-secondary/80 font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Wallet
              className={cn(
                "size-3.5",
                isWallet ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span>My Wallet</span>
            <span className="py-0.2 rounded bg-primary/10 px-1.5 text-[9px] font-bold tracking-wider text-primary uppercase">
              New
            </span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            className="relative size-9 rounded-lg border border-border/40 hover:bg-muted"
            title="Toggle theme (Press D)"
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="size-4 scale-100 rotate-0 text-amber-400 transition-transform" />
              ) : (
                <Moon className="size-4 scale-100 rotate-0 text-slate-700 transition-transform" />
              )
            ) : (
              <div className="size-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-lg border border-border/40 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="animate-in space-y-2 border-b bg-background px-4 py-3 duration-150 slide-in-from-top-2 md:hidden">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isCatalog
                ? "bg-secondary font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Sparkles
                className={cn(
                  "size-4",
                  isCatalog ? "text-primary" : "text-muted-foreground"
                )}
              />
              Catalog
            </span>
            <Badge variant="outline" className="text-xs">
              33 cards
            </Badge>
          </Link>
          <Link
            href="/calculator"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isCalculator
                ? "bg-secondary font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Calculator
                className={cn(
                  "size-4",
                  isCalculator ? "text-primary" : "text-muted-foreground"
                )}
              />
              Calculator
            </span>
            <Badge variant="default" className="text-xs">
              Live
            </Badge>
          </Link>
          <Link
            href="/wallet"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isWallet
                ? "bg-secondary font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Wallet
                className={cn(
                  "size-4",
                  isWallet ? "text-primary" : "text-muted-foreground"
                )}
              />
              My Wallet
            </span>
            <Badge
              variant={isWallet ? "default" : "outline"}
              className="text-xs"
            >
              New
            </Badge>
          </Link>
        </div>
      )}
    </header>
  )
}
