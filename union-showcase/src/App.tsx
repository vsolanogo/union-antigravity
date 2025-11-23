import { useState } from 'react';
import { Header } from './components/Header';
import { projects } from './data/projects';
import './index.css';

function App() {
  const [activeProjectId, setActiveProjectId] = useState<number | null>(1);

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
