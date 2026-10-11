// Builds transparent case reports from Investigator Agent output.
// Synthetic-demo only: reports are recommendations, never proof of fraud.
function caseWriterAgent(input = []) {
  const cases = Array.isArray(input) ? input : (Array.isArray(input.cases) ? input.cases : []);
  const reports = cases.map((item, index) => {
    const inv = item.investigation || {};
    const signals = Array.isArray(item.signals) ? item.signals : [];
    const related = item.evidenceSummary || {};
    const riskScore = Math.max(0, Math.min(100, Number(item.score ?? inv.riskScore) || 0));
    const riskLevel = riskScore >= 80 ? "high" : riskScore >= 45 ? "medium" : "low";
    const findings = [
      ...signals.map(signal => ({ type: "risk_signal", detail: String(signal) })),
      ...(Array.isArray(inv.evidence) ? inv.evidence : [])
    ];
    const reasoning = [
      `Preliminary score ${riskScore}/100 is classified as ${riskLevel} under the demo rules.`,
      signals.length ? `Observed signals: ${signals.join("; ")}.` : "No rule-based risk signals were supplied.",
      related.evidenceNote || "Related-record evidence was not supplied.",
      "This synthetic-data result is a triage recommendation, not a confirmed fraud finding."
    ];
    return {
      caseId: String(item.id || inv.transactionId || `DEMO-${String(index + 1).padStart(4, "0")}`),
      title: `Transaction investigation ${item.id || inv.transactionId || index + 1}`,
      status: "pending_human_review",
      riskSummary: { level: riskLevel, score: riskScore, explanation: "Rule-based demo score; not a probability of fraud." },
      evidence: { signals, linkedEntities: inv.linkedEntities || [], findings, relatedEvidence: related },
      reasoning,
      recommendedAction: Array.isArray(inv.nextActions) && inv.nextActions.length
        ? inv.nextActions
        : [riskScore >= 80 ? "Prioritize authorized analyst review" : "Review evidence and monitor"],
      nextAction: item.nextAction || "request_human_review",
      decisionRationale: reasoning.join(" "),
      investigation: inv,
      signals,
      evidenceSummary: related,
      humanOversight: {
        required: true,
        automaticAccountFreeze: false,
        message: "An authorized analyst must make any consequential account decision."
      },
      generatedAt: new Date().toISOString(),
      demoMode: true
    };
  });
  return { agent: "Case Writer Agent", reportsGenerated: reports.length, reports };
}
module.exports = caseWriterAgent;
