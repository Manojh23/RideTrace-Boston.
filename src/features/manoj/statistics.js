export function commuteStats(logs) {
  const count = logs.length;
  if (!count)
    return {
      count: 0,
      averageDelay: 0,
      onTimePercent: 0,
      bufferMinutes: 0,
      savingsMinutes: 0,
      routeCount: 0,
      delayByDay: [],
    };
  const delayValues = logs.map((log) => Math.max(0, log.actualMinutes - log.expectedMinutes));
  const sorted = [...delayValues].sort((a, b) => a - b);
  const mean = delayValues.reduce((sum, n) => sum + n, 0) / count;
  const onTime = logs.filter((log) => log.actualMinutes - log.expectedMinutes <= 2).length;
  const buffer = count >= 3 ? Math.ceil(sorted[Math.ceil(0.8 * count) - 1] / 5) * 5 : 0;
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const groups = weekdays.map((day) => ({ day, total: 0, count: 0 }));
  for (let i = 0; i < logs.length; i += 1) {
    const day = new Date(`${logs[i].date}T12:00:00Z`).getUTCDay();
    groups[day].total += delayValues[i];
    groups[day].count += 1;
  }
  return {
    count,
    averageDelay: Math.round(mean * 10) / 10,
    onTimePercent: Math.round((onTime / count) * 100),
    bufferMinutes: buffer,
    savingsMinutes: Math.round(
      logs.reduce((sum, log) => sum + Math.max(0, log.expectedMinutes - log.actualMinutes), 0),
    ),
    routeCount: new Set(logs.map((log) => log.route.toLowerCase())).size,
    delayByDay: groups
      .slice(1)
      .concat(groups[0])
      .map(({ day, total, count: n }) => ({
        day,
        average: n ? Math.round((total / n) * 10) / 10 : 0,
        count: n,
      })),
  };
}
