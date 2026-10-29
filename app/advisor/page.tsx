import { Metadata } from "next"
import { AdvisorChatView } from "@/components/advisor/advisor-chat-view"

export const metadata: Metadata = {
  title:
    "AI Credit Card Advisor | Personalized Recommendations & 5/24 Strategy",
  description:
    "Ask our conversational AI credit card advisor for personalized card recommendations, portfolio gap analysis, Chase 5/24 strategies, and rewards valuation math.",
}

export default function AdvisorPage() {
  return <AdvisorChatView />
}
