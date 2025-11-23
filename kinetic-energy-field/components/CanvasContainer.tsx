import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

// --- Custom Shaders ---

// A chromatic aberration filter to give a "digital glitch" / cinematic feel
const rgbShiftFragmentShader = `
  precision mediump float;
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform float distance;
  uniform vec2 dimensions;

  void main(void) {
    vec2 dir = vTextureCoord - vec2(0.5);
    float d = length(dir);
    
    // Calculate offsets based on distance from center and intensity
    vec2 offset = dir * (distance * d * 0.1);

    vec4 cr = texture2D(uSampler, vTextureCoord + offset);
    vec4 cg = texture2D(uSampler, vTextureCoord);
    vec4 cb = texture2D(uSampler, vTextureCoord - offset);

    gl_FragColor = vec4(cr.r, cg.g, cb.b, 1.0);
  }
`;

export const CanvasContainer = React.memo(() => {
  const mountRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Configuration ---
    const CONFIG = {
      particleSpacing: 25, // Tighter grid
      mouseRadius: 200,
      mouseForce: 500, // Stronger punch
      friction: 0.92, // Slipperier
      returnSpeed: 0.05, // Snappier return
      connectionThreshold: 60, // Distance to draw lines
      gridCols: 0,
      gridRows: 0,
    };

    // Cleanup previous instance
    if (appRef.current) {
      appRef.current.destroy(true, { children: true, texture: true });
      appRef.current = null;
    }

    // --- Init PIXI (v7) ---
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x020617,
      resolution: Math.min(window.devicePixelRatio || 1, 2), // Cap resolution for performance
      antialias: true,
      powerPreference: "high-performance",
    });

    appRef.current = app;
    mountRef.current.appendChild(app.view as HTMLCanvasElement);

    // --- Containers & Layers ---
    const mainContainer = new PIXI.Container();
    
    // We use a custom filter on the main container for the RGB shift effect
    const rgbFilter = new PIXI.Filter(undefined, rgbShiftFragmentShader, {
      distance: 0,
      dimensions: new PIXI.Point(window.innerWidth, window.innerHeight),
    });
    mainContainer.filters = [rgbFilter];
    
    app.stage.addChild(mainContainer);

    // Graphics for drawing connections (The "Web")
    const linesGraphics = new PIXI.Graphics();
    linesGraphics.blendMode = PIXI.BLEND_MODES.ADD;
    mainContainer.addChild(linesGraphics);

    // Container for dots
    const dotsContainer = new PIXI.Container();
    mainContainer.addChild(dotsContainer);

    // --- Particle System ---
    
    class Node {
      sprite: PIXI.Sprite;
      ox: number; // Origin X
      oy: number; // Origin Y
      x: number;
      y: number;
      vx: number;
      vy: number;
      col: number; // Grid index
      row: number; // Grid index

      constructor(texture: PIXI.Texture, x: number, y: number, col: number, row: number) {
        this.ox = x;
        this.oy = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.col = col;
        this.row = row;

        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.scale.set(0.15); // Start small
        this.sprite.alpha = 0.4;
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD; // Glowing effect
      }

      update(mouseX: number, mouseY: number, time: number) {
        // 1. Mouse Interaction
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distSq = dx * dx + dy * dy;
        const radiusSq = CONFIG.mouseRadius * CONFIG.mouseRadius;

        if (distSq < radiusSq) {
          const force = (1 - distSq / radiusSq) * CONFIG.mouseForce;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.02;
          this.vy += Math.sin(angle) * force * 0.02;
        }

        // 2. Spring Physics (Return to origin)
        const dxHome = this.ox - this.x;
        const dyHome = this.oy - this.y;
        
        this.vx += dxHome * CONFIG.returnSpeed;
        this.vy += dyHome * CONFIG.returnSpeed;

        // 3. Idle Wave Motion (Breathing effect)
        // Add a subtle sine wave offset based on position and time
        const waveX = Math.sin(time * 0.002 + this.oy * 0.01) * 0.2;
        const waveY = Math.cos(time * 0.003 + this.ox * 0.01) * 0.2;
        this.vx += waveX;
        this.vy += waveY;

        // 4. Apply Physics
        this.vx *= CONFIG.friction;
        this.vy *= CONFIG.friction;
        this.x += this.vx;
        this.y += this.vy;

        // 5. Update Sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        // 6. Dynamic Visuals
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const displacement = Math.sqrt(dxHome * dxHome + dyHome * dyHome);
        
        // Scale up when moving or displaced
        const targetScale = 0.15 + (speed * 0.02) + (displacement * 0.002);
        this.sprite.scale.set(Math.min(targetScale, 0.8));

        // Color Shift based on Energy
        // Base: 0x22d3ee (Cyan)
        // High Energy: 0xe879f9 (Purple/Pink)
        // Max Energy: 0xffffff (White)
        
        if (displacement > 50) {
            this.sprite.tint = 0xe879f9; 
            this.sprite.alpha = Math.min(0.4 + (displacement / 100), 1);
        } else {
            this.sprite.tint = 0x22d3ee;
            this.sprite.alpha = 0.3 + (Math.sin(time * 0.005 + this.ox) * 0.1); // Twinkle
        }
      }
    }

    // --- setup ---
    const texture = createGlowTexture();
    let nodes: Node[] = [];
    let grid: (Node | null)[][] = [];

    const initGrid = () => {
      // Clear
      nodes.forEach(n => {
        dotsContainer.removeChild(n.sprite);
        n.sprite.destroy();
      });
      nodes = [];
      grid = [];

      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = Math.ceil(w / CONFIG.particleSpacing) + 2; // +2 for padding
      const rows = Math.ceil(h / CONFIG.particleSpacing) + 2;
      
      CONFIG.gridCols = cols;
      CONFIG.gridRows = rows;

      const startX = (w - (cols * CONFIG.particleSpacing)) / 2;
      const startY = (h - (rows * CONFIG.particleSpacing)) / 2;

      for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
          const x = startX + i * CONFIG.particleSpacing;
          const y = startY + j * CONFIG.particleSpacing;
          const node = new Node(texture, x, y, i, j);
          nodes.push(node);
          grid[i][j] = node;
          dotsContainer.addChild(node.sprite);
        }
      }
    };

    initGrid();

    // --- Interactions ---
    const mouse = { x: -5000, y: -5000, vx: 0, vy: 0 }; // Initialize off-screen
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    window.addEventListener('mousemove', (e) => {
       const dx = e.clientX - mouse.x;
       const dy = e.clientY - mouse.y;
       // Smooth mouse velocity for effects
       mouse.vx = mouse.vx * 0.8 + dx * 0.2;
       mouse.vy = mouse.vy * 0.8 + dy * 0.2;
       
       mouse.x = e.clientX;
       mouse.y = e.clientY;
    });

    // --- Render Loop ---
    let time = 0;
    app.ticker.add((delta) => {
      time += delta;
      
      linesGraphics.clear();
      
      // Update Filter
      // Use mouse velocity to determine how much to "glitch" the screen
      const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      // Smoothly interpolate filter intensity
      const targetFilterDist = Math.min(mouseSpeed * 0.1, 10);
      rgbFilter.uniforms.distance = rgbFilter.uniforms.distance * 0.9 + targetFilterDist * 0.1;

      // Update Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.update(mouse.x, mouse.y, time);

        // --- Draw Connections (The Plexus Effect) ---
        // Optimization: Only check Right and Bottom neighbors to avoid duplicate lines
        // Optimization: Only draw lines if the node is "energized" (displaced or fast) to save draw calls
        const speed = Math.abs(node.vx) + Math.abs(node.vy);
        const disp = Math.abs(node.ox - node.x) + Math.abs(node.oy - node.y);

        // Threshold for checking connections (Optimization)
        if (speed > 0.5 || disp > 5) {
            
            // Check Right Neighbor
            if (node.col < CONFIG.gridCols - 1) {
                const rightNode = grid[node.col + 1]?.[node.row];
                if (rightNode) {
                    const dx = rightNode.x - node.x;
                    const dy = rightNode.y - node.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    // Stretch logic: if distance is stretched beyond normal spacing
                    if (dist < CONFIG.particleSpacing * 2.5) {
                        const alpha = Math.max(0, 1 - (dist / (CONFIG.particleSpacing * 2.5)));
                        linesGraphics.lineStyle(1, 0x22d3ee, alpha * 0.5);
                        linesGraphics.moveTo(node.x, node.y);
                        linesGraphics.lineTo(rightNode.x, rightNode.y);
                    }
                }
            }

            // Check Bottom Neighbor
            if (node.row < CONFIG.gridRows - 1) {
                const bottomNode = grid[node.col]?.[node.row + 1];
                if (bottomNode) {
                    const dx = bottomNode.x - node.x;
                    const dy = bottomNode.y - node.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < CONFIG.particleSpacing * 2.5) {
                        const alpha = Math.max(0, 1 - (dist / (CONFIG.particleSpacing * 2.5)));
                        linesGraphics.lineStyle(1, 0x818cf8, alpha * 0.5);
                        linesGraphics.moveTo(node.x, node.y);
                        linesGraphics.lineTo(bottomNode.x, bottomNode.y);
                    }
                }
            }
        }
      }
    });

    const onResize = () => {
      if (!appRef.current) return;
      appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
      rgbFilter.uniforms.dimensions.set(window.innerWidth, window.innerHeight);
      initGrid();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
});

// Helper: Create a soft glow texture programmatically
function createGlowTexture(): PIXI.Texture {
  const canvas = document.createElement('canvas');
  const size = 64; // Higher res texture for scaling down
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return PIXI.Texture.WHITE;

  const cx = size / 2;
  const cy = size / 2;

  // Outer soft glow
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.4, 'rgba(34, 211, 238, 0.2)'); // Cyan tint
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Inner bright core
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();

  return PIXI.Texture.from(canvas);
}
