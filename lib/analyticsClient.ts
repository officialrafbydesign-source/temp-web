export function logPlay(beatId: string) {
  fetch("/api/analytics/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ beatId }),
  });
}
