const investigatorAgent = require("./investigatorAgent");
const { riskScoringAgent } = require("./riskScoringAgent");
const { entityLinkerAgent } = require("./entityLinkerAgent");
const caseWriterAgent = require("./caseWriterAgent");

function runInvestigation(input = {}) {
  const transactions = Array.isArray(input) ? input : (Array.isArray(input.transactions) ? input.transactions : []);
  const investigation = investigatorAgent(transactions);
  const scoring = riskScoringAgent(transactions);
  const linking = entityLinkerAgent({ transactions: transactions.map(tx => ({
    transactionId: tx.id, accountId: tx.accountId, counterpartyId: tx.beneficiary, deviceId: tx.device
  })) });
  const report = caseWriterAgent(investigation.cases).reports;
  return { investigation, scoring, entityAnalysis: linking, report, demoMode: true };
}
module.exports = { runInvestigation };
