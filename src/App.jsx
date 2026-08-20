import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProjectsHome from "./pages/ProjectsHome";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import SharedDashboard from "./pages/SharedDashboard";
import { ThemeProvider } from "./context/ThemeContext";
import { IndustryProvider } from "./context/IndustryContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { getCurrentUser, logoutUser } from "./utils/auth";
import { decodeSharedData } from "./utils/shareUtils";
import { loadProjectDashboard } from "./utils/projectStorage";

export default function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  
  const [page, setPage] = useState(() => {
    if (window.location.hash.includes("#share=")) return "shared";
    return getCurrentUser() ? "projects" : "login";
  });
  const [currentProject, setCurrentProject] = useState(null);
  const [sharedData, setSharedData] = useState(() => decodeSharedData(window.location.hash));

  useEffect(() => {
    function handleHash() {
      if (window.location.hash.includes("#share=")) {
        const decoded = decodeSharedData(window.location.hash);
        if (decoded) {
          setSharedData(decoded);
          setPage("shared");
        }
      }
    }
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function goTo(name) {
    if (name === "logout" || name === "landing") {
      logoutUser();
      setUser(null);
      setPage("login");
      return;
    }
    setPage(name);
  }

  function handleAuthenticated(userInfo) {
    setUser(userInfo);
    setPage("projects");
  }

  // Opens dashboard directly if saved work exists, otherwise presents the project-detail intermediary setup screen
  function handleOpenProject(project) {
    setCurrentProject(project);
    const existingDash = loadProjectDashboard(project.id);
    if (existingDash && (existingDash.savedAt || existingDash.widgets?.length || existingDash.datasets?.length)) {
      setPage("dashboard");
    } else {
      setPage("project-detail");
    }
  }

  function handleOpenDashboard() {
    setPage("dashboard");
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <IndustryProvider>
          {page === "shared" && <SharedDashboard data={sharedData} />}
          {page === "login" && <Login goTo={goTo} onAuthenticated={handleAuthenticated} />}
          {page === "signup" && <Signup goTo={goTo} onAuthenticated={handleAuthenticated} />}
          {page === "projects" && <ProjectsHome user={user} goTo={goTo} onOpenProject={handleOpenProject} />}
          {page === "project-detail" && (
            <ProjectDetail project={currentProject} goTo={goTo} onOpenDashboard={handleOpenDashboard} />
          )}
          {page === "dashboard" && <Dashboard user={user} goTo={goTo} project={currentProject} />}
        </IndustryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}