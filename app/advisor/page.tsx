import { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { AdvisorChatView } from "@/components/advisor/advisor-chat-view"

export const metadata: Metadata = {
  title: "AI Credit Card Advisor | Personalized Recommendations & Card Perks",
  description:
    "Ask our AI credit card advisor for personalized card recommendations, understanding 5/24 rules, comparing annual fees, and maximizing your reward points.",
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
