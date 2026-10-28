import { Metadata } from "next"
import { WalletView } from "@/components/wallet/wallet-view"

export const metadata: Metadata = {
  title: "My Wallet & Chase 5/24 Tracker | Credit Card Dashboard",
  description:
    "Manage your credit card inventory, monitor Chase 5/24 status and drop-off dates, pace sign-up bonus minimum spend requirements, and track annual statement credits.",
}

export default function WalletPage() {
  return <WalletView />
}
