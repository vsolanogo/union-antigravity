# Union Showcase

This project serves as a unified gallery/showcase for multiple independent frontend projects. It uses an iframe-based architecture to display each project in isolation while providing a common navigation interface.

## 🏗 Architecture

The showcase operates on a **"Build and Embed"** strategy:

1.  **Sibling Projects**: The showcase expects other frontend projects to exist as sibling directories in the same parent folder.
2.  **Sync Script**: A Node.js script (`scripts/sync-projects.js`) automates the build process.
    *   It iterates through the configured list of projects.
    *   It builds each project using `vite build --base=/projects/<name>/`.
    *   It copies the resulting `dist` folder into `union-showcase/public/projects/<name>`.
3.  **Runtime**: The React app (`src/App.tsx`) simply points an `<iframe>` to the static `index.html` file of the selected project.

## 🚀 Getting Started

### Prerequisites
-   Node.js installed.
-   Sibling projects must be Vite-based (or buildable via `npm run build`).

### Installation
```bash
npm install
```

### Running the Showcase
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the gallery.

## 🛠 Workflow

### Adding a New Project

To add a new project to the showcase, follow these 3 steps:

1.  **Update Sync Script**:
    Open `scripts/sync-projects.js` and add the folder name of the new project to the `PROJECTS` array:
    ```javascript
    const PROJECTS = [
      // ... existing projects
      'new-project-folder-name'
    ];
    ```

2.  **Update UI Configuration**:
    Open `src/data/projects.ts` and add a new entry for the project:
    ```typescript
    export const projects: Project[] = [
      // ...
      { 
        id: 11, 
        name: 'New Project Name', 
        path: '/projects/new-project-folder-name/index.html' 
      },
    ];
    ```

3.  **Run Sync**:
    Execute the sync command to build and import the new project:
    ```bash
    npm run sync
    ```

### Updating an Existing Project
If you make changes to one of the sub-projects (e.g., `neon-aura`), you must re-run the sync command to update the showcase:
```bash
npm run sync
```
