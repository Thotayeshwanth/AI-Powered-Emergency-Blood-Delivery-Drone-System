import { mockDelay } from './api';

/**
 * AI-Powered Emergency Triage and Flight Route Recommendation Engine
 * Evaluates patient clinical urgency, blood availability scarcity, weather,
 * distance, and selects optimal drone type and priority tier.
 */
export const aiPriorityService = {
  async evaluateEmergencyPriority({
    bloodGroup,
    units,
    urgencyLevel,
    requiredMinutes,
    hospitalDistanceKm,
    clinicalNotes = '',
  }) {
    await mockDelay(250);

    let score = 50;

    // Blood rarity factor
    const rareGroups = ['O-', 'AB-', 'B-'];
    if (rareGroups.includes(bloodGroup)) {
      score += 15;
    }

    // Units volume weight
    if (units >= 3) {
      score += 10;
    }

    // Time window urgency
    const reqMins = Number(requiredMinutes) || 60;
    if (reqMins <= 20) {
      score += 25;
    } else if (reqMins <= 45) {
      score += 15;
    } else if (reqMins > 90) {
      score -= 10;
    }

    // Emergency Level specified by physician
    if (urgencyLevel === 'Critical') {
      score += 20;
    } else if (urgencyLevel === 'Urgent') {
      score += 10;
    }

    // NLP Clinical keywords check
    const lowerNotes = clinicalNotes.toLowerCase();
    const traumaKeywords = ['hemorrhage', 'rupture', 'trauma', 'mva', 'surgery', 'bleeding', 'gunshot', 'shock'];
    const matchedKeywords = traumaKeywords.filter((kw) => lowerNotes.includes(kw));
    score += Math.min(matchedKeywords.length * 6, 18);

    // Normalize 1 - 99
    score = Math.max(15, Math.min(99, score));

    let recommendedPriority = 'Normal';
    let recommendation = 'Standard autonomous drone routing on standard altitude corridor.';
    let optimalDroneType = 'Standard QuadRotor (QRP-2026)';

    if (score >= 80) {
      recommendedPriority = 'Critical';
      recommendation =
        'High Emergency Shock Risk. Fast-track automated VTOL launch clearance. Priority airspace corridor reserved.';
      optimalDroneType = 'SkyLife Falcon VTOL-8 (High Speed Cruise)';
    } else if (score >= 60) {
      recommendedPriority = 'Urgent';
      recommendation =
        'Expedited packaging requested. Blood bank reservation priority. Estimated transit < 10 mins.';
      optimalDroneType = 'HexaMed Rapid-6 (High Payload Stability)';
    }

    const estimatedFlightMins = Math.max(3, Math.round((hospitalDistanceKm || 5) * 1.6));

    return {
      score,
      recommendedPriority,
      recommendation,
      optimalDroneType,
      estimatedFlightMins,
      matchedFactors: {
        rareBloodFactor: rareGroups.includes(bloodGroup),
        highRiskKeywords: matchedKeywords,
        timeConstraint: reqMins,
      },
    };
  },
};
