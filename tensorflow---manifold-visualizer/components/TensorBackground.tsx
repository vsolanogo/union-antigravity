import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TensorBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, 
      powerPreference: "high-performance",
      alpha: false 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    container.appendChild(renderer.domElement);

    // Uniforms
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
    };

    // GLSL Shader Code
    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      #define MAX_STEPS 80
      #define MAX_DIST 100.0
      #define SURF_DIST 0.001
      #define PI 3.14159265

      // Rotation matrix
      mat2 rot(float a) {
          float s = sin(a);
          float c = cos(a);
          return mat2(c, -s, s, c);
      }

      // Smooth minimum for organic connections
      float smin(float a, float b, float k) {
          float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
          return mix(b, a, h) - k * h * (1.0 - h);
      }

      // Box Signed Distance Function
      float sdBox(vec3 p, vec3 b) {
          vec3 q = abs(p) - b;
          return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
      }

      // Tensor Structure Map
      float map(vec3 p) {
          vec3 q = p;
          
          // Domain repetition (Infinite grid)
          float gridSize = 4.0;
          vec3 id = floor((p + gridSize * 0.5) / gridSize);
          p = mod(p + gridSize * 0.5, gridSize) - gridSize * 0.5;

          // Animate rotation based on grid ID and time
          float phase = dot(id, vec3(1.0, 2.0, 3.0));
          p.xy *= rot(u_time * 0.5 + phase);
          p.xz *= rot(u_time * 0.3 + phase * 0.5);

          // Central Tensor Core (Cube)
          float d = sdBox(p, vec3(0.5));

          // Connecting "Data Lines" (Cross shape)
          float w = 0.1; // width of connections
          float crossDist = min(sdBox(p, vec3(2.5, w, w)), sdBox(p, vec3(w, 2.5, w)));
          crossDist = min(crossDist, sdBox(p, vec3(w, w, 2.5)));
          
          // Smooth blend
          d = smin(d, crossDist, 0.3);

          // Add some digital noise distortion
          float distortion = sin(p.x * 10.0 + u_time * 5.0) * sin(p.y * 10.0) * sin(p.z * 10.0) * 0.02;
          
          return d + distortion;
      }

      // Raymarching Loop
      float rayMarch(vec3 ro, vec3 rd) {
          float dO = 0.0;
          for(int i = 0; i < MAX_STEPS; i++) {
              vec3 p = ro + rd * dO;
              float dS = map(p);
              dO += dS;
              if(dO > MAX_DIST || abs(dS) < SURF_DIST) break;
          }
          return dO;
      }

      // Calculate Normal
      vec3 getNormal(vec3 p) {
          float d = map(p);
          vec2 e = vec2(0.001, 0);
          vec3 n = d - vec3(
              map(p - e.xyy),
              map(p - e.yxy),
              map(p - e.yyx)
          );
          return normalize(n);
      }

      // Lighting and Coloring
      vec3 render(vec3 ro, vec3 rd) {
          float d = rayMarch(ro, rd);
          vec3 col = vec3(0.0); // Background color (void)

          if(d < MAX_DIST) {
              vec3 p = ro + rd * d;
              vec3 n = getNormal(p);
              vec3 r = reflect(rd, n);

              // Lighting Setup
              vec3 lightPos = vec3(10.0, 10.0, -10.0);
              lightPos.xz += vec2(sin(u_time), cos(u_time)) * 5.0; // Moving light
              vec3 l = normalize(lightPos - p);

              // Diffuse
              float dif = clamp(dot(n, l), 0.0, 1.0);
              
              // Specular
              float spec = pow(max(dot(r, l), 0.0), 32.0);

              // Fresnel
              float fresnel = pow(1.0 + dot(rd, n), 3.0);

              // Color Palette: Cyberpunk / Tensor aesthetic
              vec3 baseCol = vec3(0.1, 0.05, 0.2); // Dark purple base
              vec3 glowCol = vec3(0.0, 0.8, 1.0); // Cyan glow
              
              // Map curvature to color
              float curve = length(fwidth(n));
              
              col = baseCol * dif;
              col += glowCol * spec;
              col += glowCol * fresnel * 0.8;
              col += vec3(0.5, 0.0, 1.0) * curve * 2.0; // Edge highlighting

              // Fog for depth
              col = mix(col, vec3(0.0), 1.0 - exp(-d * 0.04));
          } else {
             // Subtle background gradient for the void
             col = vec3(0.01, 0.01, 0.02) * (1.0 - rd.y);
          }

          return col;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

          // Mouse interaction affecting camera
          float mX = (u_mouse.x / u_resolution.x) * 2.0 - 1.0;
          float mY = -(u_mouse.y / u_resolution.y) * 2.0 + 1.0;

          // Camera Setup
          vec3 ro = vec3(0.0, 0.0, -3.0 + u_time * 2.0); // Moving forward
          // Add some mouse look
          ro.x += mX * 2.0;
          ro.y += mY * 2.0;
          
          vec3 lookAt = ro + vec3(0.0, 0.0, 1.0);
          
          float zoom = 1.0;
          vec3 f = normalize(lookAt - ro);
          vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
          vec3 u = cross(f, r);
          vec3 rd = normalize(f * zoom + r * uv.x + u * uv.y);

          // Render
          vec3 col = render(ro, rd);

          // Gamma Correction
          col = pow(col, vec3(0.4545));

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Create Plane
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Event Listeners
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    };

    const onMouseMove = (e: MouseEvent) => {
      uniforms.u_mouse.value.set(e.clientX, e.clientY);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationId: number;
    const animate = (time: number) => {
      uniforms.u_time.value = time * 0.001;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full block" />;
};

export default TensorBackground;