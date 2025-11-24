# Union Antigravity Showcase

This repository contains the Union Antigravity Showcase and various individual projects.

## Local Development

To run the showcase locally, follow these steps:

1.  **Navigate to the showcase directory:**

    ```bash
    cd union-showcase
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Sync projects:**

    This script builds all individual projects and copies their assets to the showcase's public directory.

    ```bash
    npm run sync
    ```

4.  **Start the development server:**

    ```bash
    npm run dev
    ```

    The showcase will be available at `http://localhost:5173/union-antigravity/`.

5.  **Build for production:**

    ```bash
    npm run build
    ```

    The built artifacts will be in the `dist` directory.
