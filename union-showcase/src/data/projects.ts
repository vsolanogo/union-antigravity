export interface Project {
    id: number;
    name: string;
    path: string;
}

export const projects: Project[] = [
    { id: 1, name: 'Neon Aura', path: `${import.meta.env.BASE_URL}projects/neon-aura/index.html` },
    { id: 2, name: 'Solar System Explorer', path: `${import.meta.env.BASE_URL}projects/solar-system-explorer/index.html` },
    { id: 3, name: 'Twin Peaks', path: `${import.meta.env.BASE_URL}projects/twin-peaks---the-black-lodge-ui/index.html` },
    { id: 4, name: 'WebGL UI Showcase', path: `${import.meta.env.BASE_URL}projects/webgl-ui-showcase/index.html` },
    { id: 5, name: 'Cosmic Rift', path: `${import.meta.env.BASE_URL}projects/cosmic-rift-portal (2)/index.html` },
    { id: 6, name: 'Dharma Initiative', path: `${import.meta.env.BASE_URL}projects/dharma-initiative-protocol/index.html` },
    { id: 7, name: 'Flux Replay', path: `${import.meta.env.BASE_URL}projects/flux-replay-parser/index.html` },
    { id: 8, name: 'Kinetic Energy', path: `${import.meta.env.BASE_URL}projects/kinetic-energy-field/index.html` },
    { id: 9, name: 'LuminaGL Buttons', path: `${import.meta.env.BASE_URL}projects/luminagl-buttons/index.html` },
    { id: 10, name: 'Neon Neural Grid', path: `${import.meta.env.BASE_URL}projects/neon-neural-grid/index.html` },
    { id: 11, name: '10X WebGL UI', path: `${import.meta.env.BASE_URL}projects/10Xwebgl-ui-showcase/index.html` },
    { id: 12, name: 'Twin Peaks V2', path: `${import.meta.env.BASE_URL}projects/v2twin-peaks---the-black-lodge-ui/index.html` },
];
