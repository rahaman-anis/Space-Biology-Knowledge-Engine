/**
 * lib/heuristics.ts
 * Centralized heuristic calculations
 * Consensus, maturity, transferability, confidence bands
 */

import type {
  Claim,
  DocMeta,
  ConsensusScore,
  MaturityScore,
  TransferabilityResult,
  ConfidenceBand,
  MaturityLevel,
  TransferabilityScore,
} from "@/types/domain"

// ============================================================================
// Consensus Calculation
// ============================================================================

/**
 * Calculate consensus score from claim status distribution
 */
export function calculateConsensus(
  supportCount: number,
  refuteCount: number,
  inconclusiveCount: number,
): ConsensusScore {
  const totalDocs = supportCount + refuteCount + inconclusiveCount

  if (totalDocs === 0) {
    return {
      score: 0,
      band: "none",
      supportCount: 0,
      refuteCount: 0,
      inconclusiveCount: 0,
      totalDocs: 0,
    }
  }

  // Calculate raw score (0-1)
  const supportRatio = supportCount / totalDocs
  const refuteRatio = refuteCount / totalDocs
  const agreement = Math.max(supportRatio, refuteRatio)

  // Adjust for total evidence volume
  const volumeBonus = Math.min(totalDocs / 10, 1) * 0.2
  const score = Math.min(agreement + volumeBonus, 1)

  // Determine confidence band
  let band: ConfidenceBand
  if (score >= 0.8) {
    band = "high"
  } else if (score >= 0.5) {
    band = "medium"
  } else if (score >= 0.3) {
    band = "low"
  } else {
    band = "none"
  }

  return {
    score,
    band,
    supportCount,
    refuteCount,
    inconclusiveCount,
    totalDocs,
  }
}

/**
 * Calculate consensus from a claim object
 */
export function calculateClaimConsensus(claim: Claim): ConsensusScore {
  const supportCount = claim.supportingDocs?.length || 0
  const refuteCount = claim.refutingDocs?.length || 0
  const inconclusiveCount = 0 // Would need additional data

  return calculateConsensus(supportCount, refuteCount, inconclusiveCount)
}

// ============================================================================
// Maturity Calculation
// ============================================================================

/**
 * Calculate maturity score from document metadata
 */
export function calculateMaturity(
  citationCount: number,
  yearsSincePublication: number,
  replicationCount = 0,
  methodologicalRigor = 0.5,
): MaturityScore {
  // Normalize factors (0-1)
  const citationScore = Math.min(citationCount / 100, 1)
  const ageScore = Math.min(yearsSincePublication / 10, 1)
  const replicationScore = Math.min(replicationCount / 5, 1)
  const rigorScore = methodologicalRigor

  // Weighted average
  const score = citationScore * 0.3 + ageScore * 0.2 + replicationScore * 0.3 + rigorScore * 0.2

  // Determine maturity level
  let level: MaturityLevel
  if (score >= 0.7) {
    level = "mature"
  } else if (score >= 0.4) {
    level = "emerging"
  } else if (score >= 0.2) {
    level = "speculative"
  } else {
    level = "unknown"
  }

  return {
    level,
    score,
    factors: {
      citationCount,
      yearsSincePublication,
      replicationCount,
      methodologicalRigor,
    },
  }
}

/**
 * Calculate maturity from document metadata
 */
export function calculateDocMaturity(doc: DocMeta): MaturityScore {
  const currentYear = new Date().getFullYear()
  const yearsSincePublication = doc.year ? currentYear - doc.year : 0
  const citationCount = doc.citationCount || 0

  return calculateMaturity(citationCount, yearsSincePublication)
}

// ============================================================================
// Transferability Calculation
// ============================================================================

/**
 * Calculate transferability score
 * Based on environmental similarity, scalability, resources, tech readiness
 */
export function calculateTransferability(
  environmentalSimilarity: number,
  scalabilityPotential: number,
  resourceRequirements: number,
  technologicalReadiness: number,
): TransferabilityResult {
  // All factors should be 0-1
  const value =
    environmentalSimilarity * 0.3 +
    scalabilityPotential * 0.25 +
    (1 - resourceRequirements) * 0.2 + // Lower requirements = higher transferability
    technologicalReadiness * 0.25

  // Determine score category
  let score: TransferabilityScore
  if (value >= 0.7) {
    score = "high"
  } else if (value >= 0.4) {
    score = "medium"
  } else if (value >= 0.2) {
    score = "low"
  } else {
    score = "unknown"
  }

  return {
    score,
    value,
    factors: {
      environmentalSimilarity,
      scalabilityPotential,
      resourceRequirements,
      technologicalReadiness,
    },
  }
}

/**
 * Estimate transferability from claim metadata
 * This is a simplified heuristic - real calculation would need more data
 */
export function estimateClaimTransferability(claim: Claim): TransferabilityResult {
  // Use confidence as a proxy for some factors
  const confidenceValue = confidenceBandToValue(claim.confidence)

  return calculateTransferability(
    confidenceValue, // Environmental similarity
    0.5, // Scalability (unknown)
    0.5, // Resource requirements (unknown)
    confidenceValue, // Tech readiness
  )
}

// ============================================================================
// Confidence Band Utilities
// ============================================================================

/**
 * Convert confidence band to numeric value (0-1)
 */
export function confidenceBandToValue(band: ConfidenceBand): number {
  switch (band) {
    case "high":
      return 0.9
    case "medium":
      return 0.6
    case "low":
      return 0.3
    case "none":
      return 0
    default:
      return 0
  }
}

/**
 * Convert numeric value to confidence band
 */
export function valueToConfidenceBand(value: number): ConfidenceBand {
  if (value >= 0.8) return "high"
  if (value >= 0.5) return "medium"
  if (value >= 0.3) return "low"
  return "none"
}

// ============================================================================
// Aggregate Heuristics
// ============================================================================

/**
 * Calculate all heuristics for a claim
 */
export function calculateClaimHeuristics(claim: Claim, docs: DocMeta[] = []) {
  const consensus = calculateClaimConsensus(claim)
  const transferability = estimateClaimTransferability(claim)

  // Calculate average maturity from supporting docs
  let avgMaturity: MaturityScore = {
    level: "unknown",
    score: 0,
    factors: {
      citationCount: 0,
      yearsSincePublication: 0,
      replicationCount: 0,
      methodologicalRigor: 0,
    },
  }

  if (docs.length > 0) {
    const maturities = docs.map(calculateDocMaturity)
    const avgScore = maturities.reduce((sum, m) => sum + m.score, 0) / maturities.length
    avgMaturity = {
      ...maturities[0],
      score: avgScore,
      level: avgScore >= 0.7 ? "mature" : avgScore >= 0.4 ? "emerging" : "speculative",
    }
  }

  return {
    consensus,
    maturity: avgMaturity,
    transferability,
  }
}

export const HEURISTICS_VERSION = "v1.0"
