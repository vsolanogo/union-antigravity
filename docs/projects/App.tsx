import { useState } from 'react';
import { Header } from './components/Header';
import { projects } from './data/projects';
import './index.css';

function App() {
  const [activeProjectId, setActiveProjectId] = useState<number | null>(() => {
    if (projects.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * projects.length);
    return projects[randomIndex].id;
  });

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="app-container">
      <Header
        projects={projects}
        activeProjectId={activeProjectId}
        onProjectSelect={setActiveProjectId}
      />
      <main className="main-content">
        {activeProject ? (
          <iframe
            src={activeProject.path}
            title={activeProject.name}
            className="project-frame"
          />
        ) : (
          <div className="placeholder">
            Select a project to view
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
