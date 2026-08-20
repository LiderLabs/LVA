// This is a real standalone app, so localStorage is a legitimate,
// simple persistence layer -- no backend exists yet, and this at
// least means work survives a page refresh, which the app couldn't
// do at all before.
//
// Every key is namespaced by industry ("general" or "pdmo") so that,
// for example, saving a PDMO dashboard never shows up in the General
// dashboard's saved-dashboards list, and vice versa -- they're
// completely separate workspaces sharing the same engine.

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Storage write failed", err);
  }
}

const dashboardsKey = (industry) => `lva-dashboards:${industry}`;
const snapshotsKey = (industry, dashboardId) => `lva-snapshots:${industry}:${dashboardId}`;
const sessionKey = (industry) => `lva-current-session:${industry}`;

/* ---------- saved dashboards ---------- */

export function listDashboards(industry) {
  return readJSON(dashboardsKey(industry), []);
}

// Saves (or updates, if id already exists) a full dashboard state.
// Returns the id, generating one if this is a first save.
export function saveDashboard(industry, { id, name, widgets, layout, datasets }) {
  const all = listDashboards(industry);
  const dashboardId = id || `dash_${Date.now()}`;
  const record = { id: dashboardId, name, widgets, layout, datasets, updatedAt: Date.now() };
  const existingIndex = all.findIndex((d) => d.id === dashboardId);
  if (existingIndex >= 0) all[existingIndex] = record;
  else all.push(record);
  writeJSON(dashboardsKey(industry), all);
  return dashboardId;
}

export function loadDashboard(industry, id) {
  return listDashboards(industry).find((d) => d.id === id) || null;
}

export function deleteDashboard(industry, id) {
  writeJSON(dashboardsKey(industry), listDashboards(industry).filter((d) => d.id !== id));
  writeJSON(snapshotsKey(industry, id), []); // clean up its snapshots too
}

export function renameDashboard(industry, id, name) {
  const all = listDashboards(industry);
  const entry = all.find((d) => d.id === id);
  if (entry) {
    entry.name = name;
    writeJSON(dashboardsKey(industry), all);
  }
}

/* ---------- snapshots (version history within one dashboard) ---------- */

export function listSnapshots(industry, dashboardId) {
  return readJSON(snapshotsKey(industry, dashboardId), []);
}

export function saveSnapshot(industry, dashboardId, { widgets, layout, label }) {
  const all = listSnapshots(industry, dashboardId);
  const record = {
    id: `snap_${Date.now()}`,
    label: label || new Date().toLocaleString(),
    savedAt: Date.now(),
    widgets,
    layout,
  };
  all.push(record);
  writeJSON(snapshotsKey(industry, dashboardId), all);
  return record.id;
}

export function deleteSnapshot(industry, dashboardId, snapshotId) {
  writeJSON(snapshotsKey(industry, dashboardId), listSnapshots(industry, dashboardId).filter((s) => s.id !== snapshotId));
}

/* ---------- current session autosave ----------
   Separate from "saved dashboards" (an explicit, named save the user
   chooses to keep) -- this is a silent, automatic save of whatever is
   currently on screen, so refreshing the page or closing the tab
   doesn't lose unsaved work. It's overwritten constantly and isn't
   meant to be browsed like the dashboards list.
*/

export function saveCurrentSession(industry, session) {
  writeJSON(sessionKey(industry), { ...session, savedAt: Date.now() });
}

export function loadCurrentSession(industry) {
  return readJSON(sessionKey(industry), null);
}

export function clearCurrentSession(industry) {
  localStorage.removeItem(sessionKey(industry));
}
