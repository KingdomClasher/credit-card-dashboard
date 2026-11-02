"use client"

import * as React from "react"
import { ChaseStatusCard, ChaseStatusCardProps } from "@/components/wallet/chase-status-card"

export { ChaseStatusCard }
export type { ChaseStatusCardProps }

export type FiveTwentyFourRadarProps = ChaseStatusCardProps

/**
 * FiveTwentyFourRadar is an alias to ChaseStatusCard for backwards compatibility.
 * Provides the consolidated timeline and slot pacing tracker.
 */
export function FiveTwentyFourRadar(props: FiveTwentyFourRadarProps) {
  return <ChaseStatusCard {...props} />
}
