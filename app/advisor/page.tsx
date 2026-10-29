import { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { AdvisorChatView } from "@/components/advisor/advisor-chat-view"

export const metadata: Metadata = {
  title:
    "AI Credit Card Advisor | Personalized Recommendations & 5/24 Strategy",
  description:
    "Ask our conversational AI credit card advisor for personalized card recommendations, portfolio gap analysis, Chase 5/24 strategies, and rewards valuation math.",
}

export default function AdvisorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <AdvisorChatView />
      </main>
    </div>
  )
}
