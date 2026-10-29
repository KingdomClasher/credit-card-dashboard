import { Webhook } from "svix"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!WEBHOOK_SECRET) {
    console.warn(
      "[Clerk Webhook] Warning: CLERK_WEBHOOK_SIGNING_SECRET is unset. Webhook verification cannot proceed."
    )
    return new Response("Webhook secret not configured", {
      status: 500,
    })
  }

  // Retrieve Svix verification headers
  const svix_id = req.headers.get("svix-id")
  const svix_timestamp = req.headers.get("svix-timestamp")
  const svix_signature = req.headers.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix verification headers", {
      status: 400,
    })
  }

  // Get raw body payload for cryptographic verification
  const payload = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as WebhookEvent
  } catch (err) {
    console.error("Error: Failed to verify webhook signature:", err)
    return new Response("Error: Invalid signature", {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, primary_email_address_id } = evt.data
    const primaryEmail =
      email_addresses?.find((e) => e.id === primary_email_address_id)
        ?.email_address ||
      email_addresses?.[0]?.email_address ||
      null

    await db
      .insert(users)
      .values({
        clerkId: id,
        email: primaryEmail,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email: primaryEmail,
          updatedAt: new Date(),
        },
      })
  } else if (eventType === "user.deleted") {
    const { id } = evt.data
    if (id) {
      await db.delete(users).where(eq(users.clerkId, id))
    }
  }

  return new Response("Webhook processed successfully", { status: 200 })
}
