export function transferStats(reports) {
  if (!reports.length) return { count: 0, medianMinutes: null, missedPercent: 0, recentCount: 0 };
  const sorted = reports.map((report) => report.transferMinutes).sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - 30);
  return {
    count: reports.length,
    medianMinutes: Math.round(median * 10) / 10,
    missedPercent: Math.round(
      (reports.filter((r) => r.missedConnection).length / reports.length) * 100,
    ),
    recentCount: reports.filter((r) => new Date(`${r.observedAt}T12:00:00Z`) >= recentThreshold)
      .length,
  };
}
