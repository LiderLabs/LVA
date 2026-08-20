export function generateShareUrl(dashboardData) {
  try {
    const payload = {
      name: dashboardData.name,
      widgets: dashboardData.widgets,
      layout: dashboardData.layout,
      datasets: dashboardData.datasets || [],
      sharedAt: Date.now(),
    };
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    const baseUrl = window.location.origin + window.location.pathname;
    return baseUrl + "#share=" + encoded;
  } catch (err) {
    console.error("Failed to generate share URL:", err);
    return window.location.href;
  }
}

export function decodeSharedData(hashString) {
  try {
    if (!hashString || !hashString.includes("#share=")) return null;
    const raw = hashString.split("#share=")[1];
    if (!raw) return null;
    const jsonString = decodeURIComponent(escape(atob(decodeURIComponent(raw))));
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to decode shared dashboard:", err);
    return null;
  }
}
