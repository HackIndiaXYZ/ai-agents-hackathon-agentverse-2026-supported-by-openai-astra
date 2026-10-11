// Scout Agent: transparent screening rules for synthetic transaction data.
function scoutAgent(transactions) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const flagged = [];
  for (const transaction of rows) {
    if (!transaction || typeof transaction !== "object") continue;
    let score = 0;
    const signals = [];
    if (Number(transaction.amount) >= 75000) { score += 28; signals.push("High-value transfer"); }
    const hour = Number(transaction.hour);
    if (Number.isFinite(hour) && (hour < 5 || hour >= 23)) { score += 25; signals.push("Odd-hour activity"); }
    if (transaction.newBeneficiary === true) { score += 20; signals.push("New beneficiary"); }
    if (Number(transaction.deviceReuse) >= 3) { score += 30; signals.push("Device reused across accounts"); }
    if (Number(transaction.velocity) >= 5) { score += 22; signals.push("Velocity spike"); }
    score = Math.min(100, score);
    if (score >= 45) flagged.push({ ...transaction, score, signals });
  }
  return { agent: "Scout Agent", scanned: rows.length, flagged: flagged.length, transactions: flagged, demoMode: true };
}
module.exports = scoutAgent;
