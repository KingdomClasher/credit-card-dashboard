import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export const runtime = "nodejs"

const SYSTEM_PROMPT = `You are the Expert AI Credit Card Advisor for the Credit Card Dashboard application.
You possess world-class financial knowledge of personal credit cards, reward multiplier math, issuer underwriting rules, and loyalty point arbitrage.

### CARD CATALOG KNOWLEDGE (35 PREMIER CARDS)
You have complete knowledge of the 35 cards in the catalog:
1. Chase Sapphire Reserve ($795 fee, 8x portal travel, 4x flights/hotels direct, 3x dining/transit, $300 travel credit, $500 hotel credit, Priority Pass + Sapphire Lounges)
2. The Platinum Card from American Express ($895 fee [recently refreshed from $695], 5x flights, 5x prepaid hotels, $200 airline credit, $200 hotel credit, $240 digital entertainment, $200 Uber Cash, $199 CLEAR+, Centurion Lounge + Priority Pass)
3. Capital One Venture X Rewards ($395 fee, 2x catch-all, 10x hotels/cars portal, 5x flights portal, $300 travel credit, 10k anniversary miles, free authorized users, Plaza Premium/Priority Pass)
4. U.S. Bank Altitude Reserve ($400 fee, 3x mobile wallet / travel, $325 annual dining/travel credit -> $75 effective fee, 1.5 cpp direct travel redemption)
5. Chase Sapphire Preferred ($95 fee, 3x dining/online grocery/streaming, 2x travel, 5x portal travel, $50 hotel credit, 10% anniversary point bonus)
6. Capital One Venture Rewards ($95 fee, 2x catch-all, 5x hotels/cars portal, 2 annual lounge visits, Global Entry/TSA credit)
7. Citi Strata Premier ($95 fee, 3x dining/supermarkets/gas/EV/air travel/hotels, 10x portal hotels/cars, $100 annual hotel benefit)
8. Wells Fargo Autograph Journey ($95 fee, 5x hotels, 4x airlines, 3x dining/travel, $50 airline credit)
9. American Express Gold Card ($325 fee, 4x dining [up to $50k/yr], 4x US supermarkets [up to $25k/yr], 3x flights, $120 dining credit, $120 Uber Cash, $100 Resy credit, $84 Dunkin credit)
10. Capital One Savor Cash Rewards ($0 fee, 3% dining, entertainment, popular streaming, grocery stores, 1% catch-all)
11. U.S. Bank Altitude Go ($0 fee, 4x dining, 2x grocery, gas, streaming, $15 annual streaming credit)
12. Chase Freedom Flex ($0 fee, 5% rotating quarterly categories up to $1,500, 3% dining/drugstores, 1% base, no FTF)
13. Chase Freedom Unlimited ($0 fee, 1.5% flat catch-all, 3% dining/drugstores, 5% portal travel)
14. Citi Double Cash ($0 fee, 2% flat cash back: 1% swipe + 1% payment, converts to TYP)
15. Citi Custom Cash ($0 fee, 5% cash back on highest eligible spend category up to $500/billing cycle, 1% base)
16. Wells Fargo Active Cash ($0 fee, 2% flat cash rewards on all purchases)
17. Wells Fargo Autograph ($0 fee, 3x dining, travel, gas, transit, popular streaming, phone plans)
18. Blue Cash Preferred from Amex ($95 fee [waived yr 1], 6% US supermarkets up to $6k/yr, 6% streaming, 3% transit/gas)
19. Blue Cash Everyday from Amex ($0 fee, 3% US supermarkets, US online retail, gas up to $6k/yr each)
20. Discover it Cash Back ($0 fee, 5% rotating quarterly categories up to $1,500 upon activation, first year cashback match)
21. Bilt Blue Card ($0 fee, 1x rent with no transaction fee up to 100k pts/yr, 3x dining, 2x travel, double points on Rent Day 1st of month)
22. World of Hyatt Credit Card ($95 fee, 4x Hyatt stays, 2x dining/flights/transit/fitness, Category 1-4 free night certificate annually)
23. Marriott Bonvoy Boundless ($95 fee, up to 17x Marriott, 3x first $6k grocery/gas/dining, 35k free night certificate annually)
24. Marriott Bonvoy Brilliant Amex ($650 fee, 6x Marriott, 3x dining/flights direct, $300 dining credit, 85k free night certificate, Platinum Elite status)
25. Hilton Honors American Express Aspire ($550 fee, 14x Hilton, 7x flights/dining/car rentals, $400 resort credit, $200 flight credit, annual Free Night Award, Diamond Elite status)
26. Hilton Honors American Express Surpass ($150 fee, 12x Hilton, 6x dining/groceries/gas, 4x US online retail, $200 Hilton credit, National Car status)
27. IHG One Rewards Premier ($150 fee, up to 26x total IHG, 5x travel/dining/gas, $100 United TravelBank cash, annual 40k Free Night Certificate)
28. Delta SkyMiles Gold Amex ($150 fee, 2x Delta/dining/US supermarkets, first checked bag free, $200 Delta flight credit after $10k spend, 15% off award bookings)
29. Delta SkyMiles Platinum Amex ($350 fee, 3x Delta/hotels, 2x dining/supermarkets, annual domestic main cabin companion certificate, $150 Resy credit, $120 rideshare credit, MQD headstart)
30. United Explorer Card ($95 fee waived yr 1, 2x United/dining/hotel stays, first checked bag free, 2 United Club one-time passes annually, 25% inflight discount)
31. United Quest Card ($250 fee, 3x United, 2x travel/dining/streaming, $125 annual United purchase credit, 2x 5,000-mile award flight credits)
32. Southwest Rapid Rewards Priority ($149 fee, 3x Southwest, 2x transit/commuting/streaming, $75 annual Southwest travel credit, 7,500 anniversary points, 4 upgraded boardings)
33. Citi / AAdvantage Platinum Select ($99 fee waived yr 1, 2x American Airlines/restaurants/gas, first checked bag free, preferred boarding, $125 flight discount after $20k spend)
34. Bank of America Customized Cash Rewards ($0 fee, 3% choice category [gas/EV, online shopping, dining, travel, drug stores, home improvement up to $2,500/quarter], 2% grocery/wholesale clubs, up to 5.25% with Preferred Rewards Platinum Honors)
35. Bank of America Premium Rewards ($95 fee, 2x travel/dining, 1.5x catch-all, up to 3.5x travel/dining and 2.625x catch-all with Preferred Rewards, $100 airline incidental credit, TSA PreCheck/Global Entry)

### ISSUER APPLICATION RULES & UNDERWRITING
- Chase 5/24 Rule: Automatic denial if applicant has opened 5 or more personal credit cards across ANY bank in the trailing 24 months. If at 4/24, the applicant has exactly 1 slot left for a Chase card. Advise applying for Chase cards BEFORE cards from any other issuer.
- Chase Sapphire 48-Month Rule: Ineligible for welcome bonus if received any Sapphire bonus within past 48 months; only 1 Sapphire card held at a time.
- Bank of America 2/3/4 Rule & 2-in-90 Days: Max 2 cards in 2 months, 3 in 12 months, 4 in 24 months across BoA. Cannot apply for 2 cards within 90 days.
- Wells Fargo 15-Month Bonus Rule & 6-Month Velocity: One Wells Fargo personal card bonus every 15 months; max 1 card per 6 months.
- American Express 5-Card Limit & 2/90 Rule: Maximum 5 credit cards at one time; max 2 credit card approvals in 90 rolling days (charge cards exempt from 5-card and 2/90 limits).
- Amex Once-Per-Lifetime Rule: Welcome bonus is strictly once per product per lifetime (5-7 years).
- Amex Family Language: Hierarchical lockout; getting Platinum first locks out Gold/Green welcome offers. Must apply bottom-up (Green -> Gold -> Platinum).
- Amex Pop-Up Jail: Algorithmic bonus restriction warning.
- Capital One 1/6 Rule & 2-Card Limit: Max 1 approval every 6 months; max 2 personal Capital One-branded rewards cards.
- Citi 8/65 Rule: Max 1 card per 8 days, max 2 cards per 65 days; 48-month bonus cooldown on Strata family.

### POINT VALUATIONS (CPP - CENTS PER POINT)
- Chase Ultimate Rewards (UR): 1.8 - 2.0 cpp (Transfer Partner benchmark 1.8 cpp; Hyatt, United, BA; 1.0 cpp cash floor)
- Amex Membership Rewards (MR): 1.8 - 2.0 cpp (Transfer Partner benchmark 1.8 cpp; Aeroplan, ANA, Flying Blue; 0.6 cpp cash floor)
- Capital One Miles: 1.7 - 1.8 cpp (Transfer Partner benchmark 1.7 cpp; 1.0 cpp travel eraser floor)
- Citi ThankYou Points (TYP): 1.6 cpp (Transfer Partner benchmark 1.6 cpp; American Airlines 1:1, 1.0 cpp cash floor)
- Bilt Rewards: 1.8 - 2.0 cpp (World of Hyatt, United, Alaska 1:1; 1.0 cpp cash floor)
- Hotel Currencies: World of Hyatt (1.8 - 2.0 cpp), Marriott Bonvoy (0.8 cpp), Hilton Honors (0.45 cpp), IHG (0.5 cpp)
- Airline Currencies: Delta (1.2 cpp), United (1.35 cpp), Southwest (1.3 cpp), AA (1.55 cpp)
- Cash Back: Fixed 1.0 cpp

### REWARD MATHEMATICS FORMULAS
- Annual Point Yield = 12 * sum(Monthly Spend * Category Multiplier)
- Gross Reward Value = Annual Points * (cpp / 100)
- Net Effective Annual Fee = Stated Annual Fee - Annual Statement Credits (that are easily and organically used)
- Net Annual Value Delta = Gross Reward Value - Net Effective Annual Fee

### REQUIRED RESPONSE FORMAT:
Every response MUST begin with a structured financial reasoning trace wrapped in \`<trace>\` tags as valid JSON:
<trace>
{
  "cardValuationMath": "Specific multiplier math and valuation calculation (e.g. 4x dining @ 1.8 cpp = 7.2% return; $600/mo spend = $518/yr gross reward yield)",
  "status524Check": "5/24 status and issuer underwriting check (e.g. At 4/24 applicant has 1 Chase slot remaining; prioritize Chase Sapphire before non-Chase issuers)",
  "feeVsRewardDelta": "Stated fee vs statement credits and net annual surplus (e.g. $325 fee - $340 credits = -$15 net effective fee; net surplus +$533/yr)"
}
</trace>

Following the \`<trace>\` tag, provide your comprehensive, beautifully formatted markdown response.
When comparing cards or presenting financial figures, include formatted code comparison blocks (using \`\`\`markdown, \`\`\`diff, or \`\`\`json) for side-by-side clarity.
Be encouraging, mathematically precise, and direct with strategic guidance.`

// Helper for generating mock streaming responses when GROQ_API_KEY is not set
function getMockResponseForPrompt(userPrompt: string): string {
  const lower = userPrompt.toLowerCase()

  if (
    lower.includes("dining") ||
    lower.includes("restaurant") ||
    lower.includes("food")
  ) {
    return `<trace>
{
  "cardValuationMath": "Amex Gold (4x MR) @ 1.8 cpp = 7.2% effective return. Capital One Savor (3% cash) = 3.0% return. US Bank Altitude Go (4% cash) = 4.0% return. On $600/mo dining ($7,200/yr), Amex Gold yields 28,800 MR (~$518.40) vs Savor ($216.00) vs Altitude Go ($288.00).",
  "status524Check": "Amex Gold and Capital One Savor are not issued by Chase. However, opening any personal card adds +1 to your Chase 5/24 status once reported to credit bureaus. If you are under 5/24 and plan to acquire Chase cards (like Sapphire Preferred or Freedom Flex), apply for Chase cards first.",
  "feeVsRewardDelta": "Amex Gold ($325 annual fee) provides $120 dining credit + $120 Uber Cash + $100 Resy credit = -$15 net effective fee (if used organically). Total net surplus: $518.40 - (-$15) = +$533.40. Capital One Savor ($0 fee) provides pure $216.00 net profit with zero holding cost."
}
</trace>

### Strategy: Top Credit Cards for Dining Spend Optimization

To maximize rewards on dining, restaurants, and food delivery, your best card depends on whether you seek **maximum point arbitrage via transferable airline/hotel miles** or **pure no-annual-fee cash back**.

\`\`\`markdown
| Card | Dining Multiplier | Effective Return | Annual Fee | Net Effective Fee | Key Synergy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **American Express® Gold** | **4x MR** (up to $50k/yr) | **7.2%** (@ 1.8 cpp) | $325 | **-$15** (via credits) | 4x US Supermarkets ($25k/yr) |
| **U.S. Bank Altitude® Go** | **4x Points** (uncapped) | **4.0%** (direct cash) | $0 | **$0** | $15 annual streaming credit |
| **Capital One Savor** | **3% Cash Back** | **3.0%** | $0 | **$0** | 3% entertainment & grocery |
| **Chase Sapphire Preferred®** | **3x UR Points** | **5.4%** (@ 1.8 cpp) | $95 | **$45** (after $50 hotel) | 1:1 Hyatt & airline transfer |
\`\`\`

#### 1. The High-Yield Champion: American Express® Gold Card
- **Why it wins:** 4x Membership Rewards points on dining worldwide plus 4x at US supermarkets (up to $25k/year). When transferred to partners like Air Canada Aeroplan, ANA, or Flying Blue, points easily yield **1.8 to 2.0+ cpp**, delivering an astronomical **7.2% to 8.0% return**.
- **Fee breakdown:** $325 annual fee offset by $120 annual dining credit ($10/mo at Grubhub, Cheesecake Factory), $120 Uber Cash ($10/mo for Uber Eats/rides), $100 Resy credit ($50 semi-annually), and $84 Dunkin' credit ($7/mo).

#### 2. The No-Fee Pure Cash Back Winner: U.S. Bank Altitude® Go
- **Why it wins:** Permanent **4x points (4% cash back)** on dining, takeout, and food delivery with **$0 annual fee**. Perfect for foodies who do not want to manage monthly statement credits.

#### 3. The 5/24 Friendly Option: Chase Sapphire Preferred® or Freedom Flex®
- If you are building toward a Chase Trifecta, the **Chase Sapphire Preferred®** (3x dining, 5.4% effective value) allows you to pool points from the **Freedom Flex®** (3x permanent dining + occasional 5% rotating dining quarters) and transfer 1:1 to **World of Hyatt** for 2.0+ cpp redemptions.`
  }

  if (
    lower.includes("4/24") ||
    lower.includes("sapphire preferred") ||
    lower.includes("eligible")
  ) {
    return `<trace>
{
  "cardValuationMath": "Chase Sapphire Preferred (CSP) earns 3x dining, 3x online grocery, 3x select streaming, 2x travel, and 5x portal travel. At 1.8 cpp transfer benchmark (e.g. World of Hyatt), 60,000 point sign-up bonus is worth $1,080.00 in travel value.",
  "status524Check": "ELIGIBLE (4/24). You have opened exactly 4 personal credit cards in the past 24 months. Chase strictly denies applications at 5/24 or higher, meaning you have exactly ONE Chase slot remaining. You MUST apply for this Chase card now before opening cards with any other bank.",
  "feeVsRewardDelta": "Stated annual fee: $95. Offset by $50 annual Chase Travel hotel credit = $45 net effective annual fee. First year value: $1,080 (SUB) + $280 (organic spend rewards) - $45 net fee = +$1,315.00 net profit."
}
</trace>

### Verification: Chase Sapphire Preferred® Eligibility at 4/24

**Yes, you are currently eligible to apply for the Chase Sapphire Preferred® Card at 4/24!** However, you are standing on a critical underwriting threshold.

\`\`\`diff
+ Current Status: 4/24 (Eligible for exactly 1 more Chase card)
- Threshold Rule: Once you open ANY personal card from ANY bank, you reach 5/24
! Strategic Action: Apply for Chase FIRST before any Amex, Capital One, or Citi cards
\`\`\`

#### Essential Underwriting Checks Before Submitting:
1. **The 5/24 Rule Ceiling:**
   Chase automatically denies card applications if your credit report reflects 5 or more personal credit card accounts opened across all banks within the last 24 months. Because you are at **4/24**, this is your **final slot**.
2. **The Sapphire 48-Month Rule:**
   You cannot receive a welcome offer on the Sapphire Preferred if:
   - You currently hold *any* active Sapphire card (Preferred or Reserve).
   - You received a welcome bonus on *any* Sapphire card within the preceding **48 months**.
3. **Application Sequencing Strategy:**
   - **Do NOT apply for non-Chase cards first.** An approval from American Express, Capital One, or Citi will immediately push you to 5/24 once the new account appears on your credit bureau report.
   - If you also want Chase business cards (like the Ink Business Cash or Ink Business Preferred), note that business cards require you to be under 5/24 to be approved, but they *do not* add to your personal 5/24 count.

#### Value Math Breakdown:
- **Sign-Up Bonus:** 60,000 points after $4,000 spend in 3 months = **$1,080 travel value** transferred 1:1 to World of Hyatt or United.
- **Annual Fee:** $95 stated fee - $50 annual hotel credit = **$45 net effective fee**.`
  }

  if (
    lower.includes("amex platinum") ||
    lower.includes("695") ||
    lower.includes("895") ||
    lower.includes("worth it")
  ) {
    return `<trace>
{
  "cardValuationMath": "5x flights booked direct or via Amex Travel @ 1.8 cpp = 9.0% effective return. $5,000 annual flight spend yields 25,000 MR points = $450.00 travel value.",
  "status524Check": "Subject to Amex Once-Per-Lifetime rule. Note Amex Family Language: acquiring the Platinum card first locks you out of future welcome bonuses on the Amex Gold and Green cards. Best practice is to hold Amex Gold first if you desire both welcome bonuses.",
  "feeVsRewardDelta": "Annual Fee is $895 (updated 2025/2026 refresh, previously $695). Organic statement credits: $200 airline incidental + $200 hotel credit + $240 digital entertainment + $200 Uber Cash = $840 potential credits. If all utilized organically, Net Effective Fee is $55. If only half utilized, Net Effective Fee is $475."
}
</trace>

### Financial Assessment: Is The Platinum Card® from American Express Worth the Annual Fee?

**Important Market Update:** The American Express Platinum card annual fee has been refreshed to **$895** (updated from the previous $695 fee). Evaluating whether this card is worth holding requires separating **organic spend offsets** from forced "coupon book" spending.

\`\`\`markdown
| Credit / Benefit | Face Value | Realistic Organic Value | Utilization Requirement |
| :--- | :--- | :--- | :--- |
| **Airline Incidental Fee Credit** | $200 / year | $180 | Select 1 airline; baggage, seat selection, lounge passes |
| **Prepaid Hotel Credit (FHR/THC)** | $200 / year | $170 | Requires booking Fine Hotels + Resorts or The Hotel Collection |
| **Digital Entertainment Credit** | $240 / year | $240 | $20/mo for Disney+, Hulu, ESPN+, NYT, Peacock |
| **Uber Cash** | $200 / year | $180 | $15/mo ($35 in Dec) for US Uber rides or Uber Eats |
| **CLEAR+ Credit** | $199 / year | $100 | Expedited airport security lane |
| **Equinox / SoulCycle Credit** | $300 / year | $0 – $50 | High friction unless already an active member |
| **Total Value Potential** | **$1,339+** | **~$870** | **Net Cost: ~$25 to $125** |
\`\`\`

#### When The Platinum Card IS Worth It:
1. **You fly at least 4–6 times per year:**
   - Unmatched lounge access: Centurion Lounges, Delta Sky Clubs (when flying Delta), and Priority Pass Select.
   - 5x Membership Rewards on flights booked directly with airlines (9.0% effective return at 1.8 cpp).
2. **You already pay for Disney+, Hulu, and use Uber/Uber Eats monthly:**
   - The $240 streaming credit and $200 Uber Cash alone offset **$440** of the fee with near-zero friction.
3. **You value luxury hotel perks:**
   - Fine Hotels + Resorts grants room upgrades, daily breakfast for two (~$80 value/day), and guaranteed 4:00 PM late checkout.

#### When It Is NOT Worth It:
- If you find managing monthly/quarterly credit expiration tedious.
- If you spend heavily on dining and everyday groceries—the **Amex Gold Card** ($325 fee, 4x dining/grocery) delivers vastly superior everyday point yields.`
  }

  if (
    lower.includes("venture x") ||
    lower.includes("reserve") ||
    lower.includes("csr") ||
    lower.includes("compare")
  ) {
    return `<trace>
{
  "cardValuationMath": "Capital One Venture X: 2x flat catch-all @ 1.7 cpp = 3.4% return; 10x hotels/cars, 5x flights portal. Chase Sapphire Reserve: 3x travel & dining @ 1.8 cpp = 5.4% return; 4x direct flights/hotels, 8x portal travel.",
  "status524Check": "Capital One enforces a 1/6 rule (1 card per 6 months) and max 2 personal rewards cards. Chase Sapphire Reserve strictly requires < 5/24 status and 48-month Sapphire bonus cooldown.",
  "feeVsRewardDelta": "Venture X: $395 fee - $300 travel credit - 10,000 anniversary miles ($100 cash floor) = -$5.00 NET EFFECTIVE FEE. CSR: $795 fee - $300 flexible travel credit - $500 The Edit hotel credit = $495.00 (or -$5 if luxury hotel credit fully utilized)."
}
</trace>

### Head-to-Head Comparison: Capital One Venture X vs. Chase Sapphire Reserve®

Both cards sit at the apex of premium travel, but their financial architectures serve fundamentally different traveler profiles:

\`\`\`markdown
| Feature | Capital One Venture X | Chase Sapphire Reserve® | Winner |
| :--- | :--- | :--- | :--- |
| **Annual Fee** | **$395** | **$795** | **Venture X** (+$400 lower) |
| **Annual Travel Credit** | $300 (Capital One Travel Portal) | $300 (Any travel swipe, automatic) | **CSR** (Much more flexible) |
| **Anniversary Bonus** | 10,000 miles (~$100–$170 value) | None | **Venture X** |
| **Net Holding Cost** | **-$5 / year** | **$495 / year** ($795 - $300) | **Venture X** (Negative fee) |
| **Everyday Multiplier** | **2x Miles** on all purchases (3.4%) | 1x base | **Venture X** |
| **Dining Multiplier** | 2x base | **3x Points** (5.4% return) | **CSR** |
| **Authorized Users** | **$0** (Free lounge access for AUs) | **$195** per cardholder | **Venture X** |
| **Lounge Access** | Capital One Lounges + Priority Pass | Sapphire Lounges + Priority Pass | **Tie** |
| **Transfer Ecosystem** | Aeroplan, Flying Blue, Avianca, BA | World of Hyatt (2.0+ cpp), United, BA | **CSR** (World of Hyatt) |
\`\`\`

\`\`\`diff
+ Venture X: Best for 90% of travelers seeking zero-friction net fee (-$5) and effortless 2x catch-all spend.
- Sapphire Reserve: Premium powerhouse justified by 1:1 World of Hyatt point redemptions and $300 friction-free travel credit.
\`\`\`

#### Strategic Verdict:
- **Choose Capital One Venture X** if you want a premium lounge card that **pays you $5/year to keep it in your wallet** ($395 fee offset by $300 portal credit and $100 anniversary miles) with 2x miles on every unbonused dollar.
- **Choose Chase Sapphire Reserve®** if you spend heavily on direct dining and travel ($10k+/yr) and redeem points through **World of Hyatt**, where redemptions consistently exceed **2.0 cents per point**.`
  }

  // Generic grounded response for any other credit card query
  return `<trace>
{
  "cardValuationMath": "Calculated based on 35-card catalog benchmarks: Transferable points (UR/MR/Bilt) valued at 1.8 cpp; Capital One Miles at 1.7 cpp; Cash back at fixed 1.0 cpp floor.",
  "status524Check": "Application sequencing: Chase cards strictly enforce 5/24; prioritize Chase slots prior to applying for Amex, Capital One, Citi, Wells Fargo, or Bank of America products.",
  "feeVsRewardDelta": "Net holding cost calculated as Stated Annual Fee minus direct high-utility statement credits. Optimize for positive annual surplus."
}
</trace>

### Personalized Credit Card Strategy Analysis

Based on your financial inquiry and our 35-card credit card catalog, here is the strategic recommendation:

\`\`\`markdown
| Priority Category | Recommended Card | Reward Rate | Net Effective Fee | Key Underwriting Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Travel & Lifestyle** | **Chase Sapphire Preferred®** | 3x Dining / 2x Travel | $45 ($95 - $50 credit) | Chase 5/24 Rule |
| **Everyday Groceries** | **American Express® Gold** | 4x US Supermarket / 4x Dining | -$15 ($325 - $340 credits) | Amex Once-Per-Lifetime |
| **Flat Catch-All** | **Capital One Venture X** | 2x Everywhere | -$5 ($395 - $400 credits) | 1/6 Rule & 2-Card Limit |
| **No-Fee Optimization** | **Chase Freedom Flex®** | 5% Rotating Categories | $0 | Chase 5/24 Rule |
\`\`\`

#### Core Maximization Principles:
1. **Respect the 5/24 Underwriting Window:**
   Always secure your target Chase credit cards (Sapphire Preferred, Freedom Flex, World of Hyatt) before acquiring cards from American Express, Capital One, or Citi.
2. **Target Transferable Point Arbitrage:**
   Points earned in Chase Ultimate Rewards (UR) and Amex Membership Rewards (MR) yield **1.8 to 2.0+ cents each** when transferred to premium airline partners or World of Hyatt, doubling the value of typical 1% to 2% cash back cards.
3. **Audit Net Effective Fees Annually:**
   Ensure every annual fee is offset by organic spending credits (travel credits, Uber Cash, dining credits) rather than spending extra money simply to recoup a fee.`
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const latestMessage =
      messages && messages.length > 0
        ? messages[messages.length - 1].content || ""
        : ""

    const apiKey = process.env.GROQ_API_KEY

    // If Groq API key is present, stream using Groq llama-3.3-70b-versatile
    if (apiKey) {
      try {
        const result = streamText({
          model: groq("llama-3.3-70b-versatile"),
          system: SYSTEM_PROMPT,
          messages,
        })
        return result.toTextStreamResponse()
      } catch (groqErr) {
        console.warn(
          "Groq streaming error, falling back to mock stream:",
          groqErr
        )
        // Fall back to mock stream below
      }
    }

    // Fallback mock streaming response ensures zero breakages during testing / no key
    const mockText = getMockResponseForPrompt(latestMessage)
    const encoder = new TextEncoder()
    const words = mockText.split(" ")

    const stream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "))
          // 15ms delay per token delivers responsive and smooth streaming
          await new Promise((resolve) => setTimeout(resolve, 15))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("API /api/chat error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
