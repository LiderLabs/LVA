const PROJECTS_KEY = "lva-projects";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
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

export function formatGhanaDateTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  
  const dateStr = date.toLocaleDateString("en-GB", {
    timeZone: "GMT",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  const timeStr = date.toLocaleTimeString("en-GB", {
    timeZone: "GMT",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const hour = date.getUTCHours();
  let period = "Morning";
  if (hour >= 12 && hour < 17) {
    period = "Afternoon";
  } else if (hour >= 17 || hour < 4) {
    period = "Evening";
  }

  return `${dateStr} at ${timeStr} GMT (${period})`;
}

export function listProjects() {
  return readJSON(PROJECTS_KEY, []);
}

export function saveProject(project) {
  const all = listProjects();
  const projectId = project.id || "proj_" + Date.now();
  const record = {
    id: projectId,
    name: project.name,
    status: project.status || "ongoing",
    createdAt: project.createdAt || Date.now(),
    updatedAt: Date.now(),
    completedAt: project.completedAt || null,
  };
  const idx = all.findIndex((p) => p.id === projectId);
  if (idx >= 0) all[idx] = { ...all[idx], ...record };
  else all.push(record);
  writeJSON(PROJECTS_KEY, all);
  return projectId;
}

export function updateProjectStatus(id, status) {
  const all = listProjects();
  const entry = all.find((p) => p.id === id);
  if (entry) {
    entry.status = status;
    entry.updatedAt = Date.now();
    if (status === "completed") {
      entry.completedAt = Date.now();
    } else {
      entry.completedAt = null;
    }
    writeJSON(PROJECTS_KEY, all);
  }
}

export function deleteProject(id) {
  writeJSON(PROJECTS_KEY, listProjects().filter((p) => p.id !== id));
  localStorage.removeItem("lva_proj_dash_" + id);
}

export function renameProject(id, name) {
  const all = listProjects();
  const entry = all.find((p) => p.id === id);
  if (entry) {
    entry.name = name;
    entry.updatedAt = Date.now();
    writeJSON(PROJECTS_KEY, all);
  }
}

export function saveProjectDashboard(projectId, dashboardData) {
  if (!projectId) return;
  const now = Date.now();
  writeJSON("lva_proj_dash_" + projectId, {
    ...dashboardData,
    savedAt: now,
    savedAtFormatted: formatGhanaDateTime(now),
  });

  const all = listProjects();
  const entry = all.find((p) => p.id === projectId);
  if (entry) {
    entry.updatedAt = now;
    writeJSON(PROJECTS_KEY, all);
  }
}

export function loadProjectDashboard(projectId) {
  if (!projectId) return null;
  return readJSON("lva_proj_dash_" + projectId, null);
}