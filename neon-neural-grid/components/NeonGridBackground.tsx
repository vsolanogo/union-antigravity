
import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export const NeonGridBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Prevent double initialization
    if (appRef.current) return;

    const initPixi = () => {
      const app = new PIXI.Application({
        resizeTo: window,
        backgroundColor: 0x020205, // Deepest void blue
        resolution: Math.min(window.devicePixelRatio || 1, 2), // Cap resolution for performance
        autoDensity: true,
        antialias: true, // Important for line rendering
        powerPreference: 'high-performance',
      });

      appRef.current = app;

      if (containerRef.current) {
        containerRef.current.appendChild(app.view as unknown as Node);
      }

      // --- LAYERS ---
      // 1. Background (Stars/Dust)
      // 2. Connections (Lines)
      // 3. Nodes (Particles)
      // 4. FX (Mouse Trail)
      
      const starContainer = new PIXI.Container();
      const connectionGraphics = new PIXI.Graphics();
      const nodeContainer = new PIXI.Container();
      const fxContainer = new PIXI.Container();

      // Additive blending for that "Neon" glow look
      connectionGraphics.blendMode = PIXI.BLEND_MODES.ADD;
      nodeContainer.blendMode = PIXI.BLEND_MODES.ADD;
      fxContainer.blendMode = PIXI.BLEND_MODES.ADD;

      app.stage.addChild(starContainer);
      app.stage.addChild(connectionGraphics);
      app.stage.addChild(nodeContainer);
      app.stage.addChild(fxContainer);

      // --- TEXTURE GENERATION ---
      
      // 1. Soft Glow Particle
      const particleGraphics = new PIXI.Graphics();
      particleGraphics.beginFill(0xFFFFFF, 0.1);
      particleGraphics.drawCircle(0, 0, 32); // Large faint glow
      particleGraphics.endFill();
      particleGraphics.beginFill(0xFFFFFF, 0.5);
      particleGraphics.drawCircle(0, 0, 12); // Medium core
      particleGraphics.endFill();
      particleGraphics.beginFill(0xFFFFFF, 1);
      particleGraphics.drawCircle(0, 0, 4); // Sharp center
      particleGraphics.endFill();
      const particleTexture = app.renderer.generateTexture(particleGraphics);

      // 2. Star Texture
      const starGraphics = new PIXI.Graphics();
      starGraphics.beginFill(0xFFFFFF, 1);
      starGraphics.drawCircle(0, 0, 2);
      starGraphics.endFill();
      const starTexture = app.renderer.generateTexture(starGraphics);

      // --- GRID SETUP ---
      const gridCols = 30; // Slightly less density for clearer lines
      const gridRows = 20;
      let particles: any[] = [];
      
      // Using a 2D array for easy neighbor access
      let grid: any[][] = [];

      const initGrid = () => {
        // Clear previous
        nodeContainer.removeChildren();
        particles = [];
        grid = [];

        const spacingX = app.screen.width / gridCols;
        const spacingY = app.screen.height / gridRows;

        for (let i = 0; i <= gridCols; i++) {
          grid[i] = [];
          for (let j = 0; j <= gridRows; j++) {
            const sprite = new PIXI.Sprite(particleTexture);
            const originalX = i * spacingX;
            const originalY = j * spacingY;

            sprite.x = originalX;
            sprite.y = originalY;
            sprite.anchor.set(0.5);
            sprite.scale.set(0.5);
            sprite.tint = 0x00FFFF;
            sprite.alpha = 0.8;

            // Physics Props
            (sprite as any).vx = 0;
            (sprite as any).vy = 0;
            (sprite as any).originX = originalX;
            (sprite as any).originY = originalY;
            (sprite as any).mass = 1 + Math.random(); // Varied mass for organic feel
            (sprite as any).ix = i; // Grid indices
            (sprite as any).iy = j;

            nodeContainer.addChild(sprite);
            particles.push(sprite);
            grid[i][j] = sprite;
          }
        }
      };

      initGrid();

      // --- BACKGROUND STARS SETUP ---
      const starCount = 150;
      const stars: any[] = [];
      for(let i=0; i<starCount; i++) {
        const star = new PIXI.Sprite(starTexture);
        star.x = Math.random() * app.screen.width;
        star.y = Math.random() * app.screen.height;
        star.alpha = Math.random() * 0.5 + 0.1;
        const scale = Math.random() * 0.5 + 0.2;
        star.scale.set(scale);
        // Depth factor (0 = far, 1 = close)
        (star as any).z = Math.random(); 
        starContainer.addChild(star);
        stars.push(star);
      }

      // --- INTERACTION ---
      const mouse = { x: -5000, y: -5000, active: false };
      
      // FX Arrays
      let trailParticles: any[] = [];
      let shockwaves: any[] = [];

      const onMouseMove = (e: MouseEvent) => {
        const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;

        // Emit trail particles
        if (Math.random() > 0.5) {
            const t = new PIXI.Sprite(starTexture);
            t.x = mouse.x + (Math.random() - 0.5) * 10;
            t.y = mouse.y + (Math.random() - 0.5) * 10;
            t.alpha = 1;
            t.scale.set(Math.random() * 0.8 + 0.2);
            t.tint = 0xFF00FF; // Magenta trail
            (t as any).life = 1.0;
            (t as any).vx = (Math.random() - 0.5) * 2;
            (t as any).vy = (Math.random() - 0.5) * 2;
            fxContainer.addChild(t);
            trailParticles.push(t);
        }
      };

      const onClick = (e: MouseEvent) => {
          // Create Shockwave
          shockwaves.push({
              x: mouse.x,
              y: mouse.y,
              radius: 0,
              strength: 150,
              life: 1.0
          });
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mousedown', onClick);

      // --- ANIMATION LOOP ---
      let time = 0;
      
      // Color Palette (Cyberpunk)
      // We will interpolate between these based on time and position
      const colors = [0x00FFFF, 0x0099FF, 0x7700FF, 0xFF0055];

      app.ticker.add((delta) => {
        time += 0.005 * delta;

        // 1. Update Shockwaves
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const wave = shockwaves[i];
            wave.radius += 15 * delta;
            wave.life -= 0.02 * delta;
            if (wave.life <= 0) {
                shockwaves.splice(i, 1);
            }
        }

        // 2. Update Trail Particles
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i];
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.life -= 0.03 * delta;
            p.alpha = p.life;
            p.scale.set(p.life * 0.8);
            if (p.life <= 0) {
                fxContainer.removeChild(p);
                trailParticles.splice(i, 1);
            }
        }

        // 3. Update Background Stars (Parallax)
        for (const star of stars) {
            // Stars move slowly to the left, faster if 'closer' (higher z)
            star.x -= (0.2 + star.z * 0.5) * delta;
            // Wrap around
            if (star.x < 0) star.x = app.screen.width;
            
            // Mouse Parallax influence
            if (mouse.active) {
                const dx = (mouse.x - app.screen.width/2) * 0.0001 * star.z;
                const dy = (mouse.y - app.screen.height/2) * 0.0001 * star.z;
                star.x -= dx;
                star.y -= dy;
            }
            // Twinkle
            star.alpha = 0.1 + Math.abs(Math.sin(time * 5 + star.x)) * 0.5 * star.z;
        }

        // 4. Update Grid Particles & Physics
        connectionGraphics.clear();
        
        // Settings
        const stiffness = 0.05;
        const damping = 0.88;
        const interactionRadius = 250;
        
        // Pre-calculate color based on time
        const colorTime = Math.abs(Math.sin(time * 0.5));
        
        for (const p of particles) {
            // A. Mouse Repulsion
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < interactionRadius) {
                const force = (interactionRadius - dist) / interactionRadius;
                const angle = Math.atan2(dy, dx);
                const push = force * 60; // Stronger push
                p.vx -= Math.cos(angle) * push * 0.1;
                p.vy -= Math.sin(angle) * push * 0.1;
            }

            // B. Shockwave Interaction
            for (const wave of shockwaves) {
                const wx = p.x - wave.x;
                const wy = p.y - wave.y;
                const wDist = Math.sqrt(wx * wx + wy * wy);
                const waveWidth = 50;
                
                // If particle is within the ring of the shockwave
                if (Math.abs(wDist - wave.radius) < waveWidth) {
                    const wAngle = Math.atan2(wy, wx);
                    const wForce = wave.strength * wave.life * (1 - Math.abs(wDist - wave.radius)/waveWidth);
                    p.vx += Math.cos(wAngle) * wForce * 0.1;
                    p.vy += Math.sin(wAngle) * wForce * 0.1;
                }
            }

            // C. Spring Physics (Return to origin)
            const ox = p.originX - p.x;
            const oy = p.originY - p.y;
            p.vx += ox * stiffness;
            p.vy += oy * stiffness;

            // D. Damping
            p.vx *= damping;
            p.vy *= damping;

            // E. Apply
            p.x += p.vx * delta;
            p.y += p.vy * delta;

            // F. Visuals
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const displacement = Math.sqrt(ox * ox + oy * oy);
            
            // Dynamic Tinting
            // Base color is blue/cyan. High energy turns magenta/white.
            if (speed > 2 || displacement > 50) {
                 p.tint = 0xFF00AA; // Magenta
                 p.scale.set(0.6 + Math.min(speed * 0.05, 0.4));
                 p.alpha = 1;
            } else {
                 // Idle color wave
                 // Spatial color wave:
                 const spatialFactor = (p.originX / app.screen.width) + (p.originY / app.screen.height) + time;
                 const hue = Math.sin(spatialFactor) * 0.5 + 0.5;
                 
                 // Mix Cyan (0x00FFFF) and Purple (0x7700FF)
                 // Simple threshold for performance or full lerp? Let's do simple lerp simulation
                 if(hue > 0.5) p.tint = 0x00FFFF;
                 else p.tint = 0x7700FF;

                 p.scale.set(0.3);
                 p.alpha = 0.5;
            }

            // G. Draw Connections (Right and Down only to avoid duplicates)
            // Optimization: Only draw if within reasonable distance
            const neighbors = [
                { ix: p.ix + 1, iy: p.iy },
                { ix: p.ix, iy: p.iy + 1 }
            ];

            for (const n of neighbors) {
                if (n.ix <= gridCols && n.iy <= gridRows) {
                    const neighbor = grid[n.ix][n.iy];
                    
                    // Distance check for line opacity
                    const lx = neighbor.x - p.x;
                    const ly = neighbor.y - p.y;
                    const lDistSq = lx*lx + ly*ly;
                    
                    // Max draw distance squared (to avoid sqrt)
                    // Standard spacing is ~ 40-60px. Let's say max 150px
                    if (lDistSq < 25000) {
                        const alpha = 1 - (lDistSq / 25000);
                        if (alpha > 0.05) {
                            // Line Color matches particle energy
                            const lineColor = (speed > 2 || neighbor.vx*neighbor.vx + neighbor.vy*neighbor.vy > 4) 
                                            ? 0xFF55AA : 0x004488;
                            
                            connectionGraphics.lineStyle(1, lineColor, alpha * 0.6);
                            connectionGraphics.moveTo(p.x, p.y);
                            connectionGraphics.lineTo(neighbor.x, neighbor.y);
                        }
                    }
                }
            }
        }
      });

      // --- RESIZE ---
      const onResize = () => {
          if(!app.renderer) return;
          // Re-init grid on significant resize to keep aspect ratio or just update origins
          // For simplicity/robustness, we re-calc origins
          const newSpacingX = app.screen.width / gridCols;
          const newSpacingY = app.screen.height / gridRows;
          
          for (let i = 0; i <= gridCols; i++) {
              for (let j = 0; j <= gridRows; j++) {
                  if (grid[i] && grid[i][j]) {
                      const p = grid[i][j];
                      p.originX = i * newSpacingX;
                      p.originY = j * newSpacingY;
                  }
              }
          }
      };
      
      window.addEventListener('resize', onResize);
      setIsReady(true);
      
      // Store cleanup
      (app as any)._customCleanup = () => {
         window.removeEventListener('mousemove', onMouseMove);
         window.removeEventListener('mousedown', onClick);
         window.removeEventListener('resize', onResize);
      };
    };

    initPixi();

    return () => {
      if (appRef.current) {
        if ((appRef.current as any)._customCleanup) {
            (appRef.current as any)._customCleanup();
        }
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div 
        ref={containerRef} 
        id="canvas-container" 
        className="w-full h-full absolute inset-0 bg-[#020205]"
        style={{ opacity: isReady ? 1 : 0, transition: 'opacity 1.5s ease-out' }}
    />
  );
};
