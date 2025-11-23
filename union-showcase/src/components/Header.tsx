import React from 'react';
import type { Project } from '../data/projects';

interface HeaderProps {
    projects: Project[];
    activeProjectId: number | null;
    onProjectSelect: (id: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ projects, activeProjectId, onProjectSelect }) => {
    return (
        <header className="header">
            <div className="logo">UNION SHOWCASE</div>
            <nav className="nav">
                {projects.map((project) => (
                    <button
                        key={project.id}
                        className={`nav-item ${activeProjectId === project.id ? 'active' : ''}`}
                        onClick={() => onProjectSelect(project.id)}
                        title={project.name}
                    >
                        {project.id}
                    </button>
                ))}
            </nav>
        </header>
    );
};
