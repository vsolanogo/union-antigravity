import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SHOWCASE_ROOT = path.resolve(__dirname, '..');
const PROJECTS_ROOT = path.resolve(SHOWCASE_ROOT, '..');
const PUBLIC_DIR = path.resolve(SHOWCASE_ROOT, 'public', 'projects');

// List of projects to sync
const PROJECTS = [
    'neon-aura',
    'solar-system-explorer',
    'twin-peaks---the-black-lodge-ui',
    'webgl-ui-showcase',
    'cosmic-rift-portal (2)',
    'dharma-initiative-protocol',
    'flux-replay-parser',
    'kinetic-energy-field',
    'luminagl-buttons',
    'neon-neural-grid',
    '10Xwebgl-ui-showcase',
    'v2twin-peaks---the-black-lodge-ui',
    'los-santos-ui---webgl-buttons',
    'dota-2-webgl-ui',
    'dota-2-webgl-ui--V2'
];

// Ensure public/projects exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

console.log('🚀 Starting project sync...');

PROJECTS.forEach(projectName => {
    const projectPath = path.join(PROJECTS_ROOT, projectName);
    const distPath = path.join(projectPath, 'dist');
    const targetPath = path.join(PUBLIC_DIR, projectName);

    if (!fs.existsSync(projectPath)) {
        console.warn(`⚠️  Project not found: ${projectName}`);
        return;
    }

    console.log(`\n📦 Processing ${projectName}...`);

    try {
        // Install dependencies
        console.log(`   Installing dependencies...`);
        execSync('npm install', { cwd: projectPath, stdio: 'inherit' });

        // Build project
        console.log(`   Building...`);
        execSync(`npm run build -- --base="/union-antigravity/projects/${projectName}/"`, { cwd: projectPath, stdio: 'inherit' });

        // Copy dist to public/projects
        if (fs.existsSync(targetPath)) {
            console.log(`   Cleaning old assets...`);
            fs.rmSync(targetPath, { recursive: true, force: true });
        }

        console.log(`   Copying assets...`);
        fs.cpSync(distPath, targetPath, { recursive: true });

        console.log(`✅ ${projectName} synced successfully!`);
    } catch (error) {
        console.error(`❌ Failed to sync ${projectName}:`, error.message);
    }
});

console.log('\n✨ All projects processed!');
