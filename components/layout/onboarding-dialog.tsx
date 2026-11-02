"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  Calculator,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Lock,
  Flame,
  Layers,
  DollarSign,
  Percent,
} from "lucide-react"

export const OPEN_ONBOARDING_EVENT = "open-onboarding-dialog"

export function openOnboardingTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_ONBOARDING_EVENT))
  }
}

interface StepData {
  step: number
  title: string
  subtitle: string
  explanation: string
  icon: React.ElementType
  iconColor: string
  badgeBg: string
}

const STEPS: StepData[] = [
  {
    step: 1,
    title: "Explore & Compare Cards",
    subtitle: "Step 1 of 3 - Discovery & Comparison",
    explanation:
      "Browse 35+ top credit cards with clean essential badges (Annual Fee, Top Multiplier, Bonus Value) and comprehensive perk sheets.",
    icon: CreditCard,
    iconColor: "text-blue-500 dark:text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    step: 2,
    title: "Calculate Your True Rewards",
    subtitle: "Step 2 of 3 - Net Value Modeling",
    explanation:
      "Input your monthly spending across categories to see your net annual profit after accounting for annual fees and statement credits.",
    icon: Calculator,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    step: 3,
    title: "Track Wallet & Bank Limits",
    subtitle: "Step 3 of 3 - Approval Guardrails & Pacing",
    explanation:
      "Monitor your Chase 5/24 status, multi-issuer velocity rules, and minimum spend pacing (MSR) with zero bank logins required.",
    icon: ShieldCheck,
    iconColor: "text-violet-500 dark:text-violet-400",
    badgeBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
]

const emptySubscribe = () => () => {}

export function OnboardingDialog() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [open, setOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(1)

  // Initial visit auto-open check
  React.useEffect(() => {
    try {
      const hasSeen = localStorage.getItem("hasSeenOnboarding")
      if (hasSeen !== "true") {
        const timer = setTimeout(() => {
          setOpen(true)
        }, 600)
        return () => clearTimeout(timer)
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, [])

  // Listen for custom trigger from navbar
  React.useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(1)
      setOpen(true)
    }

    window.addEventListener(OPEN_ONBOARDING_EVENT, handleOpen)
    return () => {
      window.removeEventListener(OPEN_ONBOARDING_EVENT, handleOpen)
    }
  }, [])

  // Keyboard navigation (Left / Right arrow keys)
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, 3))
      } else if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const markSeenAndDismiss = React.useCallback(() => {
    try {
      localStorage.setItem("hasSeenOnboarding", "true")
    } catch {
      // Ignore localStorage access restrictions
    }
    setOpen(false)
  }, [])

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        markSeenAndDismiss()
      } else {
        setOpen(true)
      }
    },
    [markSeenAndDismiss]
  )

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    } else {
      markSeenAndDismiss()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  if (!mounted) {
    return null
  }

  const currentStepData = STEPS[currentStep - 1]
  const CurrentIcon = currentStepData.icon

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-5 sm:max-w-xl sm:p-6">
        {/* Step Indicator Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pr-10 sm:pr-12">
            <div className="flex items-center gap-1.5">
              {STEPS.map((step) => {
                const isActive = step.step === currentStep
                const isPassed = step.step < currentStep

                return (
                  <button
                    key={step.step}
                    type="button"
                    onClick={() => setCurrentStep(step.step)}
                    className={cn(
                      "h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? "w-8 bg-primary"
                        : isPassed
                          ? "w-3 bg-primary/60 hover:bg-primary/80"
                          : "w-3 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                    )}
                    aria-label={`Jump to step ${step.step}: ${step.title}`}
                  />
                )
              })}
            </div>

            <Badge
              variant="outline"
              className={cn("px-2.5 py-0.5 text-[11px] font-medium shrink-0", currentStepData.badgeBg)}
            >
              Step {currentStep} of 3
            </Badge>
          </div>

          <DialogHeader className="gap-1.5 text-left">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl border p-2 shadow-xs",
                  currentStepData.badgeBg
                )}
              >
                <CurrentIcon className={cn("size-5", currentStepData.iconColor)} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight sm:text-xl">
                  {currentStepData.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {currentStepData.subtitle}
                </p>
              </div>
            </div>

            <DialogDescription className="mt-1 text-sm leading-relaxed text-foreground/80">
              {currentStepData.explanation}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Step-specific Showcase Content */}
        <div className="my-2 rounded-xl border bg-muted/30 p-4">
          {currentStep === 1 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-blue-500" />
                  <span className="text-xs font-semibold text-foreground">
                    Essential Card Badges
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  35+ Cards Included
                </Badge>
              </div>

              {/* Badges preview row */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <DollarSign className="size-3.5 text-emerald-500" />
                    <span>Annual Fee</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">
                    $0 - $695
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    Net cost clarity
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Flame className="size-3.5 text-amber-500" />
                    <span>Top Multiplier</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">
                    Up to 5x - 6x
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    Dining, Travel, Groceries
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Sparkles className="size-3.5 text-purple-500" />
                    <span>Bonus Value</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">
                    $200 - $1,200+
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    Sign-up rewards
                  </div>
                </div>
              </div>

              {/* Feature bullet points */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Click any card to inspect full perk sheets, statement credit schedules, and insurances.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Select up to 4 cards to run side-by-side head-to-head comparisons.
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-foreground">
                    Net Profit Calculation Formula
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Real-Time Math
                </Badge>
              </div>

              {/* Formula Card */}
              <div className="rounded-lg border bg-card p-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="font-semibold">Rewards Earned</span>
                    <span className="text-muted-foreground">(Spend x Multipliers)</span>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="text-blue-600 dark:text-blue-400">
                    <span className="font-semibold">Credits</span>
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="text-destructive">
                    <span className="font-semibold">Fee</span>
                  </div>
                  <span className="text-muted-foreground">=</span>
                  <div className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
                    True Net Value
                  </div>
                </div>
              </div>

              {/* Interactive preview pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Category Spend Inputs
                  </div>
                  <div className="mt-1 font-semibold text-foreground">
                    9 Categories Modeled
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    Dining, Travel, Groceries, Gas, etc.
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Valuation Toggle
                  </div>
                  <div className="mt-1 font-semibold text-foreground">
                    Cash vs. Transfer Points
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    1.0c base or 1.5c+ partner value
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Find out if cards with high annual fees actually save or cost you money based on your real spending.
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-violet-500" />
                  <span className="text-xs font-semibold text-foreground">
                    Zero Bank Logins Required
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                  100% Private
                </Badge>
              </div>

              {/* Limits and velocity pills */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Chase 5/24 Gauge
                    </span>
                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                      Slot Tracker
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">
                    Drop-off Dates & Status
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    Know exactly when slots open
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Multi-Issuer Velocity
                    </span>
                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                      Amex / Citi / CapOne
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">
                    Application Rules
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    Avoid unnecessary hard pull denials
                  </div>
                </div>
              </div>

              {/* MSR Pacing Callout */}
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-2.5 text-xs text-foreground">
                <div className="flex items-center gap-1.5 font-semibold text-violet-600 dark:text-violet-400">
                  <Percent className="size-3.5" />
                  <span>Minimum Spend Pacing (MSR)</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-normal">
                  Track sign-up bonus spend requirements with daily pacing targets so you never miss a deadline.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={markSeenAndDismiss}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip Tour
          </Button>

          <div className="flex items-center gap-2 sm:justify-end">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-1 text-xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleNext}
                className="gap-1 text-xs font-semibold"
              >
                <span>Next</span>
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleNext}
                className="gap-1 bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <Sparkles className="size-3.5" />
                <span>Get Started</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
