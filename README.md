# Credit Card Dashboard & Reward Optimization Engine

> An enterprise-grade financial intelligence and rewards optimization web application built with **Next.js 16**, **Tailwind CSS v4**, **ShadCN UI**, **Clerk**, **Supabase / Drizzle ORM**, and **ShadCN AI Elements**.

---

## 📌 Overview & System Architecture

Modern credit card rewards feature lucrative welcome offers ($200 to $2,800+ in value), complex ecosystem point valuations (1.0 cpp cash floors up to 2.0+ cpp transferable valuations), strict issuer underwriting rules (Chase 5/24, Amex once-per-lifetime, Capital One 1/6), and rising annual fees offset by fragmented "coupon-book" statement credits.

**Credit Card Dashboard** is a unified command center designed to optimize cardholder value while maintaining an absolute **Zero-PAN Architecture**.

### 🛡️ Zero-PAN Security Model
* **No Primary Account Numbers (PAN):** This application never asks for, ingests, processes, or stores 15- or 16-digit credit card numbers, CVVs, or expiration dates.
* Cards in user portfolios are tracked exclusively via static catalog identifiers (`id` slugs such as `amex-gold` or `chase-sapphire-preferred`) and user-assigned nicknames or credit lines.
* **100% PCI-Scope Free:** Completely eliminates security and compliance risk for personal and multi-tenant deployments.

---

## 🚀 Key Features & Roadmap

| Feature / Task | Description | Status |
| :--- | :--- | :---: |
| **1. Card Catalog & Discovery Grid** | Multi-dimensional faceted filtering (issuers, fee tiers, networks, category multipliers), sorting, search, and responsive Card Detail Sheet. | ✅ **Completed** (PR #1) |
| **2. Interactive Rewards & Fee Calculator** | Dynamic 9-category spending matrix, persona presets, cpp point valuation toggle, net annual fee waterfall, and side-by-side card comparison dialog. | ✅ **Completed** (PR #2) |
| **3. Clerk Auth & Supabase Backend** | Secure user authentication, route protection (`/sign-in`, `/sign-up`), Supabase PostgreSQL database with Drizzle ORM schema, and Svix webhook synchronization. | 🟡 **In Progress** |
| **4. My Wallet & 5/24 Tracker** | Personalized card inventory, Chase 5/24 radar with drop-off countdowns, MSR minimum spend pacing, renewal radar, and monthly credit checklist. | 📋 **Queued** |
| **5. Conversational AI Advisor** | Fast financial advisor powered by Groq (`llama-3.3-70b-versatile`) with ShadCN AI elements (`MessageScroller`, `Bubble`, reasoning traces, Shiki syntax). | 📋 **Queued** |

---

## 🛠️ Technology Stack

* **Framework:** [Next.js 16.4.2](https://nextjs.org/) (App Router, Turbopack, React Server Components)
* **Language & Runtime:** TypeScript 5, Node.js 20.9+ LTS
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/) (`base-nova` style with `@base-ui/react`), [Lucide React](https://lucide.dev/) icons
* **AI UI Primitives:** ShadCN AI Elements (`message-scroller`, `message`, `bubble`, `trace`, `code-block`, `attachment`)
* **Authentication:** [Clerk](https://clerk.com/) (`@clerk/nextjs` v7+) with route proxy middleware
* **Database & ORM:** PostgreSQL ([Supabase](https://supabase.com/)), [Drizzle ORM](https://orm.drizzle.team/), Drizzle Kit
* **AI Inference:** [Groq AI SDK](https://groq.com/) (`@ai-sdk/groq` with `llama-3.3-70b-versatile`)

---

## 💳 How to Update & Add Credit Cards

The catalog source of truth is located in:
📁 [`app/data/cards.json`](./app/data/cards.json)

An extensive research document detailing sign-up bonus terms, point valuations, and issuer rules is maintained in:
📄 [`docs/credit_card_research.md`](./docs/credit_card_research.md)

### 1. Card Data Schema Structure

Each card entry in `app/data/cards.json` follows this structured schema:

```json
{
  "id": "amex-gold",
  "name": "American Express® Gold Card",
  "issuer": "American Express",
  "network": "American Express",
  "annualFee": 325,
  "effectiveFee": 10,
  "cardHighlight": "Best for Dining & US Supermarkets",
  "creditScore": "Good to Excellent (670-850)",
  "rewardType": "points",
  "pointCurrency": "American Express Membership Rewards",
  "pointValuationCpp": 2.0,
  "welcomeOffer": {
    "points": 60000,
    "msr": 6000,
    "months": 6,
    "valueUsd": 1200,
    "expires": null
  },
  "multipliers": {
    "dining": 4,
    "groceries": 4,
    "flights": 3,
    "hotels": 1,
    "gas": 1,
    "transit": 1,
    "streaming": 1,
    "onlineRetail": 1,
    "other": 1
  },
  "credits": [
    {
      "name": "Uber Cash",
      "amount": 120,
      "frequency": "monthly",
      "description": "$10/month in Uber Cash for rides or Eats in the US",
      "category": "dining"
    },
    {
      "name": "Dining Credit",
      "amount": 120,
      "frequency": "monthly",
      "description": "$10/month at Grubhub, The Cheesecake Factory, Goldbelly, Five Guys",
      "category": "dining"
    },
    {
      "name": "Resy Credit",
      "amount": 100,
      "frequency": "semi-annual",
      "description": "$50 semi-annually for eligible Resy purchases",
      "category": "dining"
    },
    {
      "name": "Dunkin' Credit",
      "amount": 84,
      "frequency": "monthly",
      "description": "$7/month at US Dunkin' locations",
      "category": "dining"
    }
  ],
  "perks": [
    "4X points on dining worldwide (up to $50,000/yr)",
    "4X points at US supermarkets (up to $25,000/yr)",
    "3X points on flights booked directly or via AmexTravel",
    "Up to $424 in annual statement credits",
    "No Foreign Transaction Fees",
    "Secondary Car Rental Loss and Damage Insurance",
    "Baggage Insurance Plan & Global Assist Hotline"
  ],
  "rating": 4.9,
  "applyUrl": "https://www.americanexpress.com"
}
```

### 2. How to Add a New Card
1. Open `app/data/cards.json` in your code editor.
2. Add a new JSON object to the array with a unique `id` slug (e.g., `us-bank-altitude-reserve`).
3. Fill in:
   * **`annualFee`**: Sticker annual fee in dollars.
   * **`cardHighlight`**: A crisp, 1-line promotional summary badge displayed prominently on cards.
   * **`multipliers`**: Numerical reward multipliers (e.g. `dining: 3` for 3x / 3%).
   * **`credits`**: All recurring statement credits offsetting the fee.
   * **`perks`**: List of key benefits (lounge access, travel insurance, cell phone protection, zero foreign transaction fees, purchase protection).
4. Save the file. Turbopack hot-reloads the changes immediately on both `/` and `/calculator`.

### 3. How to Update Existing Card Terms & Highlights
* **To highlight a card:** Adjust the `cardHighlight` string (e.g. `"Top Luxury Travel Lounge Access"` or `"Best Flat 2% Cash Back"`).
* **To modify perks:** Add or edit items in the `perks` array. The Catalog detail sheet automatically displays these as checkmark highlights.
* **To update credits:** Edit the `credits` array. The Net Fee Calculator waterfall dynamically recalculates out-of-pocket holding costs in real time.

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** 20.9+ LTS
* **npm** or **pnpm**

### Installation

```bash
# Clone repository
git clone https://github.com/KingdomClasher/credit-card-dashboard.git
cd credit-card-dashboard

# Install dependencies
npm install

# Start development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts
* `npm run dev` — Launches Next.js dev server on port 3000.
* `npm run build` — Compiles production Next.js build.
* `npm run start` — Starts production server.
* `npm run lint` — Runs Next.js ESLint checks.

---

## 📄 License
Private repository © 2026 KingdomClasher. All rights reserved.
