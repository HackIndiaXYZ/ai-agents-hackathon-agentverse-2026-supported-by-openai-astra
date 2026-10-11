const test = require("node:test");
const assert = require("node:assert/strict");
const scout = require("../agents/scoutAgent");
const runSwarm = require("../agents/agentOrchestrator");
const { riskScoringAgent } = require("../agents/riskScoringAgent");
const { runInvestigation } = require("../agents/runInvestigation");

test("Scout flags a transaction with multiple signals and safely handles invalid input", () => {
  const result = scout([{ id: "T1", amount: 90000, hour: 2, newBeneficiary: true, deviceReuse: 1, velocity: 1 }, null]);
  assert.equal(result.scanned, 2);
  assert.equal(result.flagged, 1);
  assert.ok(result.transactions[0].score <= 100);
  assert.equal(scout(null).flagged, 0);
});

test("Risk scorer reports transparent factors and bounded scores", () => {
  const result = riskScoringAgent([{ id: "T2", amount: 100000, hour: 2, newBeneficiary: true, deviceReuse: 4, velocity: 6 }]);
  assert.equal(result.rowsScored, 1);
  assert.equal(result.results[0].riskScore, 100);
  assert.equal(result.results[0].riskLevel, "high");
  assert.ok(result.results[0].factors.length >= 4);
});

test("Orchestrator produces case reports, traces, and human review gate", () => {
  const result = runSwarm([
    { id: "T3", amount: 100000, hour: 2, newBeneficiary: true, deviceReuse: 4, velocity: 6, device: "D1", beneficiary: "B1" },
    { id: "T4", amount: 2000, hour: 12, newBeneficiary: false, deviceReuse: 1, velocity: 1, device: "D1", beneficiary: "B2" }
  ]);
  assert.ok(result.rowsScanned >= 2);
  assert.ok(result.reportsGenerated >= 1);
  assert.ok(result.cases.length >= 1);
  assert.ok(result.trace.some(x => x.agent === "Human Analyst"));
  assert.equal(result.decisionSummary.autonomousAccountActions, false);
  assert.ok(result.cases[0].caseReport || result.cases[0].riskSummary);
});

test("runInvestigation returns a report without throwing", () => {
  const result = runInvestigation({ transactions: [{ id: "T5", amount: 90000, hour: 1, newBeneficiary: true, deviceReuse: 3, velocity: 6, device: "D", beneficiary: "B" }] });
  assert.ok(result.report);
});
