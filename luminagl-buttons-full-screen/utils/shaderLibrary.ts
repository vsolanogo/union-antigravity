
// Common Vertex Shader
export const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Helper: Advanced Noise functions for shaders
// We use a robust hash and value noise interpolation
const noiseChunk = `
  float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
  }

  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i + vec2(0.0, 0.0));
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal Brownian Motion
  float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // Rotate to reduce axial bias
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
      for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }
`;

// Fragment Shader: Neon Pulse (SDF Box with Smoky Plasma Glow)
export const neonPulseFragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_hover;
  uniform float u_click_time;

  ${noiseChunk}

  float sdBox(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r);
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / u_resolution.y;
    
    // Breathing container
    float breath = sin(u_time * 2.0) * 0.005;
    vec2 boxSize = vec2(0.44 * (u_resolution.x / u_resolution.y), 0.44) + breath;
    float d = sdBox(p, boxSize, 0.08);

    // Dynamic Smoke/Plasma within the border
    float t = u_time * u_speed;
    vec2 noiseUV = uv * 3.0;
    float plasma = fbm(noiseUV + vec2(0.0, t * 0.5));
    // Add a second layer moving oppositely
    plasma += fbm(noiseUV * 2.0 - vec2(t * 0.2, 0.0)) * 0.5;
    
    // Intensity increases on hover
    float glowIntensity = 0.015 + (0.04 * u_hover);
    
    // Electric Arc effect on hover
    if (u_hover > 0.01) {
       float arc = smoothstep(0.4, 0.45, noise(uv * 10.0 + t * 5.0));
       glowIntensity += arc * u_hover * 0.02;
    }

    float glow = glowIntensity / (abs(d) + 0.001);
    
    // Sharp edge
    float border = smoothstep(0.005, 0.0, d);
    
    // Interior fill
    float fill = smoothstep(0.0, -0.01, d);
    vec3 interiorColor = mix(u_color1, u_color2, plasma);
    
    // Click Ripple
    float clickWave = 0.0;
    if (u_click_time > 0.0) {
        float ct = u_time - u_click_time;
        if (ct < 1.0 && ct > 0.0) {
            float waveDist = length(uv - u_mouse);
            clickWave = smoothstep(0.02, 0.0, abs(waveDist - ct * 1.5)) * (1.0 - ct);
        }
    }

    // Compose
    vec3 col = vec3(0.0);
    col += border * u_color2 * 1.5; // Bright border
    col += fill * interiorColor * u_hover * 0.5; // Dim interior that lights up
    col += glow * mix(u_color1, u_color2, 0.5); // Outer glow
    col += vec3(1.0) * clickWave; // White shockwave

    gl_FragColor = vec4(col * u_intensity, 1.0);
  }
`;

// Fragment Shader: Molten Alloy (Ferrofluid style)
export const liquidPlasmaFragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_hover;
  uniform vec2 u_mouse;

  ${noiseChunk}

  void main() {
    vec2 uv = vUv;
    float t = u_time * u_speed * 0.5;
    
    // Distort UVs based on mouse
    float mouseDist = distance(uv, u_mouse);
    vec2 distortion = (uv - u_mouse) * (1.0 - smoothstep(0.0, 0.3, mouseDist)) * u_hover * 0.2;
    vec2 p = uv + distortion;
    
    // Liquid Metal Logic (Domain Warping)
    vec2 q = vec2(0.);
    q.x = fbm( p + 0.00*t );
    q.y = fbm( p + vec2(1.0) );

    vec2 r = vec2(0.);
    r.x = fbm( p + 1.0*q + vec2(1.7,9.2)+ 0.15*t );
    r.y = fbm( p + 1.0*q + vec2(8.3,2.8)+ 0.126*t);

    float f = fbm(p+r);

    // Color grading based on noise value
    vec3 col = mix(u_color1, u_color2, clamp((f*f)*4.0,0.0,1.0));
    col = mix(col, vec3(0.0, 0.0, 0.2), clamp(length(q),0.0,1.0));
    col = mix(col, vec3(1.0), clamp(r.x, 0.0, 1.0) * 0.2); // Highlights

    // Specular highlight (simulating 3D surface liquid)
    vec2 grad = vec2(dFdx(f), dFdy(f)); // Needs extension usually, but often works. If fails, use finite diff.
    // Fallback finite difference for compatibility if needed (simplified here)
    float light = dot(normalize(vec3(grad * 10.0, 1.0)), normalize(vec3(0.5, 0.5, 1.0)));
    col += pow(max(light, 0.0), 4.0) * 0.5;

    gl_FragColor = vec4(col * u_intensity, 1.0);
  }
`;

// Fragment Shader: Vaporwave Curve
export const cyberGridFragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_hover;
  uniform vec2 u_mouse;

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float t = u_time * u_speed;

    // Curvature (fake sphere/cylinder effect)
    float bend = 1.0 - dot(uv, uv) * 0.2;
    vec2 curvedUV = uv / bend;
    
    // Horizon
    float horizon = -0.2;
    if (curvedUV.y > horizon) {
        // Retro Sun
        float sunDist = length(curvedUV - vec2(0.0, 0.3));
        float sun = smoothstep(0.5, 0.45, sunDist);
        
        // Sun stripes
        float stripes = sin(curvedUV.y * 50.0 - t);
        float stripeMask = smoothstep(0.0, 0.1, stripes);
        if (curvedUV.y < 0.2) sun *= stripeMask;

        vec3 bg = mix(vec3(0.0), u_color1 * 0.5, curvedUV.y + 0.5);
        gl_FragColor = vec4(mix(bg, vec3(1.0, 0.5, 0.0), sun) * u_intensity, 1.0);
        return;
    }

    // 3D Plane Projection
    float z = 1.0 / abs(curvedUV.y - horizon);
    float x = curvedUV.x * z;
    
    float movement = t * 2.0;
    if (u_hover > 0.0) movement += t * 4.0; // Turbo
    
    vec2 gridUV = vec2(x, z + movement);
    
    // Grid lines
    vec2 grid = abs(fract(gridUV) - 0.5) * 2.0;
    float line = smoothstep(0.8, 0.95, max(grid.x, grid.y));
    
    // Fade into distance
    float fog = smoothstep(10.0, 1.0, z);
    
    vec3 col = mix(vec3(0.0), u_color2, line * fog);
    
    // "Data" packets flowing
    float packet = smoothstep(0.9, 1.0, sin(z * 0.5 - t * 10.0) * sin(x * 0.5));
    col += u_color1 * packet * fog;

    gl_FragColor = vec4(col * u_intensity, 1.0);
  }
`;

// Fragment Shader: Warp Tunnel
export const starFieldFragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_hover;
  uniform vec2 u_mouse; // Use mouse to steer

  ${noiseChunk}

  void main() {
    vec2 uv = vUv - 0.5;
    // Steer tunnel with mouse
    vec2 offset = (u_mouse - 0.5) * 0.5 * u_hover;
    uv += offset;
    
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    
    float t = u_time * u_speed;
    
    // Warp tunnel effect
    float ss = 0.5 + (sin(t) * 0.1);
    vec2 p = vec2(1.0/r + t, a / 3.14159);
    
    // Tunnel Texture
    float noiseVal = fbm(p * 5.0);
    float grid = smoothstep(0.4, 0.5, abs(sin(p.y * 10.0) * sin(p.x * 2.0)));
    
    vec3 col = mix(vec3(0.0), u_color1, noiseVal);
    col += u_color2 * grid * r; // Brighter at center
    
    // Center glow (End of tunnel)
    col += u_color2 * (0.1 / r);
    
    // Vignette
    col *= smoothstep(0.8, 0.2, r);

    gl_FragColor = vec4(col * u_intensity, 1.0);
  }
`;

// Fragment Shader: Prismatic Hologram
export const holographicFragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_hover;
  uniform vec2 u_mouse;

  void main() {
    vec2 uv = vUv;
    float t = u_time * u_speed;
    
    // Base holographic noise pattern
    float pattern = sin(uv.x * 100.0 + t) * sin(uv.y * 80.0 - t * 0.5);
    pattern += sin(uv.x * 30.0 + uv.y * 30.0 + t * 2.0);
    
    // Mouse interaction acts as light source angle
    float lightAngle = distance(uv, u_mouse);
    
    // Color Dispersion (Rainbow/Prism effect)
    // We shift the phase for R, G, B based on view angle (mouse)
    float r = sin(pattern + lightAngle * 5.0);
    float g = sin(pattern + lightAngle * 5.5 + 1.0);
    float b = sin(pattern + lightAngle * 6.0 + 2.0);
    
    vec3 hologram = vec3(r, g, b) * 0.5 + 0.5;
    
    // Mix with base colors to keep theme
    vec3 theme = mix(u_color1, u_color2, uv.y);
    vec3 col = mix(theme, hologram, 0.4 + u_hover * 0.3);
    
    // Scanlines
    float scan = smoothstep(0.4, 0.6, sin(uv.y * 200.0 + t * 10.0));
    col *= (0.8 + 0.2 * scan);
    
    // Glitch effect on hover
    if (u_hover > 0.0) {
        float glitch = step(0.98, sin(t * 20.0));
        vec3 glitchCol = vec3(col.b, col.r, col.g); // Swizzle
        col = mix(col, glitchCol, glitch);
    }
    
    // Fresnel Rim
    float dist = distance(uv, vec2(0.5));
    col += vec3(1.0) * smoothstep(0.4, 0.5, dist) * 0.3;

    gl_FragColor = vec4(col * u_intensity, 1.0);
  }
`;
