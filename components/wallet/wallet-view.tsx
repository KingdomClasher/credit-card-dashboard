"use client"

import * as React from "react"
import { useWallet } from "@/lib/hooks/use-wallet"
import { Navbar } from "@/components/layout/navbar"
import { FiveTwentyFourRadar } from "@/components/wallet/five-twenty-four-radar"
import { MSRTrackerCard } from "@/components/wallet/msr-tracker-card"
import { CreditRedemptionChecklist } from "@/components/wallet/credit-redemption-checklist"
import { CardInventoryList } from "@/components/wallet/card-inventory-list"
import { AddCardModal } from "@/components/wallet/add-card-modal"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Wallet,
  CreditCard,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  Target,
  Sparkles,
  Plus,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function WalletView() {
  const {
    cards,
    msrItems,
    creditItems,
    metrics,
    fiveTwentyFour,
    allCatalogCards,
    addCard,
    updateCard,
    removeCard,
    updateMSRSpend,
    addMSRSpendIncrement,
    removeMSRItem,
    toggleCreditRedemption,
    resetCreditRedemptions,
    resetToDemo,
  } = useWallet()

  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("dashboard")

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header / Hero */}
        <div className="flex flex-col gap-4 border-b border-border/60 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Wallet className="size-5" />
              </div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
                My Wallet Portfolio
              </h1>
              <Badge
                variant="secondary"
                className="border-primary/20 bg-primary/10 text-xs font-semibold text-primary uppercase"
              >
                Zero-PAN
              </Badge>
            </div>
            <p className="max-w-3xl text-xs text-muted-foreground sm:text-sm">
              Monitor your credit card inventory, track Chase 5/24 pacing &
              drop-off dates, pace sign-up bonus minimum spend requirements, and
              redeem annual statement credits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDemo}
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Reset portfolio to pre-populated demo data"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Demo</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="h-9 gap-1.5 px-3.5 text-xs font-semibold shadow-xs"
            >
              <Plus className="size-4" />
              <span>Add Card to Wallet</span>
            </Button>
          </div>
        </div>

        {/* 4 Key Header Metrics Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Chase 5/24 Status */}
          <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card to-card/70 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Chase 5/24 Status
              </span>
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg border",
                  fiveTwentyFour.isUnderLimit
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                )}
              >
                {fiveTwentyFour.isUnderLimit ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <ShieldAlert className="size-4" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-black tracking-tight text-foreground">
                  {fiveTwentyFour.count}/24
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold uppercase",
                    fiveTwentyFour.isUnderLimit
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {fiveTwentyFour.isUnderLimit ? "Under Limit" : "Over Limit"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {fiveTwentyFour.isUnderLimit
                  ? `${fiveTwentyFour.slotsRemaining} Chase ${fiveTwentyFour.slotsRemaining === 1 ? "slot" : "slots"} remaining`
                  : `Next drop-off: ${fiveTwentyFour.formattedDropOff}`}
              </p>
            </CardContent>
          </Card>

          {/* 2. Total Annual Fees */}
          <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card to-card/70 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Total Annual Fees
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Receipt className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-black tracking-tight text-foreground">
                  ${metrics.totalAnnualFees}
                  <span className="text-sm font-normal text-muted-foreground">
                    /yr
                  </span>
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Obligation across {cards.length} portfolio card
                {cards.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>

          {/* 3. Total Credit Limit */}
          <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card to-card/70 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Total Credit Limit
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <CreditCard className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-black tracking-tight text-foreground">
                  ${metrics.totalCreditLimit.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total credit capacity across active accounts
              </p>
            </CardContent>
          </Card>

          {/* 4. Active MSR Count */}
          <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card to-card/70 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Active MSR Count
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Target className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-black tracking-tight text-foreground">
                  {metrics.activeMSRCount} Active
                </span>
                {metrics.activeMSRCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-semibold text-primary"
                  >
                    Pacing
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {metrics.activeMSRCount > 0
                  ? `$${(metrics.totalTargetSpend - metrics.totalCurrentSpend).toLocaleString()} spend remaining`
                  : "All welcome bonuses completed"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 h-9">
              <TabsTrigger
                value="dashboard"
                className="gap-1.5 text-xs font-medium"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Overview Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="gap-1.5 text-xs font-medium"
              >
                <CreditCard className="size-3.5" />
                <span>Card Inventory ({cards.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="radar"
                className="gap-1.5 text-xs font-medium"
              >
                <ShieldCheck className="size-3.5" />
                <span>Chase 5/24 Radar</span>
              </TabsTrigger>
              <TabsTrigger value="msr" className="gap-1.5 text-xs font-medium">
                <Target className="size-3.5" />
                <span>MSR Pacing ({msrItems.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="credits"
                className="gap-1.5 text-xs font-medium"
              >
                <Sparkles className="size-3.5" />
                <span>Statement Credits ({creditItems.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW DASHBOARD TAB */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Top row: 5/24 Radar + MSR Pacing side-by-side */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <FiveTwentyFourRadar status={fiveTwentyFour} />
                </div>
                <div className="lg:col-span-6">
                  <MSRTrackerCard
                    items={msrItems}
                    onUpdateSpend={updateMSRSpend}
                    onAddSpendIncrement={addMSRSpendIncrement}
                    onRemoveItem={removeMSRItem}
                    onAddNewMSR={() => setAddModalOpen(true)}
                  />
                </div>
              </div>

              {/* Middle row: Statement Credit Checklist */}
              <div>
                <CreditRedemptionChecklist
                  items={creditItems}
                  onToggleRedemption={toggleCreditRedemption}
                  onResetRedemptions={resetCreditRedemptions}
                />
              </div>

              {/* Bottom row: Card Inventory */}
              <div>
                <CardInventoryList
                  cards={cards}
                  catalogCards={allCatalogCards}
                  msrItems={msrItems}
                  creditItems={creditItems}
                  onUpdateCard={updateCard}
                  onRemoveCard={removeCard}
                  onOpenAddModal={() => setAddModalOpen(true)}
                  onResetToDemo={resetToDemo}
                />
              </div>
            </TabsContent>

            {/* CARD INVENTORY TAB */}
            <TabsContent value="inventory">
              <CardInventoryList
                cards={cards}
                catalogCards={allCatalogCards}
                msrItems={msrItems}
                creditItems={creditItems}
                onUpdateCard={updateCard}
                onRemoveCard={removeCard}
                onOpenAddModal={() => setAddModalOpen(true)}
                onResetToDemo={resetToDemo}
              />
            </TabsContent>

            {/* CHASE 5/24 RADAR TAB */}
            <TabsContent value="radar" className="mx-auto max-w-4xl space-y-6">
              <FiveTwentyFourRadar status={fiveTwentyFour} />
            </TabsContent>

            {/* MSR PACING TAB */}
            <TabsContent value="msr" className="mx-auto max-w-4xl space-y-6">
              <MSRTrackerCard
                items={msrItems}
                onUpdateSpend={updateMSRSpend}
                onAddSpendIncrement={addMSRSpendIncrement}
                onRemoveItem={removeMSRItem}
                onAddNewMSR={() => setAddModalOpen(true)}
              />
            </TabsContent>

            {/* STATEMENT CREDITS TAB */}
            <TabsContent
              value="credits"
              className="mx-auto max-w-4xl space-y-6"
            >
              <CreditRedemptionChecklist
                items={creditItems}
                onToggleRedemption={toggleCreditRedemption}
                onResetRedemptions={resetCreditRedemptions}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Card to Wallet Dialog */}
      <AddCardModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        catalogCards={allCatalogCards}
        onAddCard={addCard}
      />
    </div>
  )
}
