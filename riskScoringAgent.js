// Explainable rule-based scoring for synthetic demonstration data.
// Scores are triage points, not calibrated fraud probabilities.
function riskScoringAgent(input = {}) {
  const transactions = Array.isArray(input) ? input : (Array.isArray(input.transactions) ? input.transactions : []);
  const results = transactions.map(tx => {
    let score = 0;
    const factors = [];
    const add = (condition, points, label) => {
      if (condition) { score += points; factors.push({ label, points }); }
    };
    add(Number(tx.amount) >= 75000, 28, "High-value transfer");
    add(Number(tx.hour) < 5 || Number(tx.hour) >= 23, 25, "Odd-hour activity");
    add(tx.newBeneficiary === true, 20, "New beneficiary");
    add(Number(tx.deviceReuse) >= 3, 30, "Device reused across accounts");
    add(Number(tx.velocity) >= 5, 22, "High transaction velocity");
    score = Math.min(100, score);
    return { transactionId: tx.id ?? null, riskScore: score,
      riskLevel: score >= 80 ? "high" : score >= 45 ? "medium" : "low",
      factors, requiresReview: score >= 45 };
  });
  return {
    agent: "Risk Scoring Agent",
    method: "transparent_rule_based",
    rowsScored: results.length,
    highRisk: results.filter(x => x.riskLevel === "high").length,
    mediumRisk: results.filter(x => x.riskLevel === "medium").length,
    lowRisk: results.filter(x => x.riskLevel === "low").length,
    results,
    demoMode: true
  };
}
module.exports = { riskScoringAgent };
