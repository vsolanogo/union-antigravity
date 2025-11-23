// Common Vertex Shader
export const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Helper: Noise function for shaders
const noiseChunk = `
  float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
  }
`;

// Fragment Shader: Neon Pulse (SDF Box with Glow)
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
  uniform float u_hover; // 0.0 to 1.0
  uniform float u_click_time; // Time of last click

  // SDF for a rounded box
  float sdBox(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + r;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
  }

  void main() {
    // Aspect ratio correction
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / u_resolution.y;
    
    // Box dimensions
    vec2 boxSize = vec2(0.45 * (u_resolution.x / u_resolution.y), 0.45);
    float d = sdBox(p, boxSize, 0.1);

    // Dynamic glow
    float t = u_time * u_speed;
    float glowAnim = sin(t * 3.0) * 0.5 + 0.5;
    
    // Intensity increases on hover
    float glowIntensity = 0.02 + (0.05 * u_hover);
    float glow = glowIntensity / abs(d);
    
    // Sharp edge
    float border = smoothstep(0.01, 0.0, d);
    
    // Interior fill effect on hover
    float fill = smoothstep(0.0, -0.01, d) * u_hover * 0.3;
    
    // Click Ripple
    float clickWave = 0.0;
    if (u_click_time > 0.0) {
        float ct = u_time - u_click_time;
        if (ct < 1.0 && ct > 0.0) {
            float waveDist = length(uv - u_mouse);
            clickWave = smoothstep(0.0, 0.1, 0.1 - abs(waveDist - ct * 1.5)) * (1.0 - ct);
        }
    }

    // Color mixing
    vec3 col = mix(u_color1, u_color2, uv.x + sin(t));
    
    // Final composite
    vec3 finalColor = col * (glow + fill) * u_intensity;
    finalColor += border * u_color2; // Solid border line
    finalColor += vec3(1.0) * clickWave; // White ripple

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Fragment Shader: Molten Alloy (Liquid Plasma)
export const liquidPlasmaFragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_hover;

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Speed up on hover
    float speed = u_speed * (1.0 + u_hover * 2.0);
    float t = u_time * speed;
    
    // Domain warping
    vec2 p = uv;
    for(float i = 1.0; i < 4.0; i++) {
        p.x += 0.3 / i * sin(i * 3.0 * p.y + t);
        p.y += 0.3 / i * cos(i * 3.0 * p.x + t);
    }
    
    float v = sin(p.x + p.y + t);
    
    // Metallic ridges
    v = smoothstep(0.4, 0.6, abs(v));
    
    // Color mapping
    vec3 col = mix(u_color1, u_color2, v);
    
    // Hot spots on hover
    col += vec3(1.0, 0.8, 0.5) * smoothstep(0.9, 1.0, v) * u_hover;
    
    // Vignette
    float vig = 1.0 - dot(uv, uv) * 0.5;
    
    gl_FragColor = vec4(col * vig * u_intensity, 1.0);
  }
`;

// Fragment Shader: Synthwave Grid
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
    vec2 uv = vUv;
    
    // Horizon transform
    float horizon = 0.5 + (u_mouse.y - 0.5) * 0.1;
    float fov = 0.5;
    
    // Map UV to 3D plane
    float y = uv.y - horizon;
    
    // Sky/Ground split
    if (y < 0.0) {
        // Retro Sky
        float sunDist = length(uv - vec2(0.5, horizon + 0.2));
        float sun = smoothstep(0.3, 0.29, sunDist);
        // Sun gradients
        vec3 sky = mix(u_color1 * 0.2, u_color2, 1.0 + y * 4.0);
        sky += vec3(1.0, 0.5, 0.0) * sun;
        gl_FragColor = vec4(sky * u_intensity, 1.0);
        return;
    }
    
    // Ground
    float z = fov / y;
    float x = (uv.x - 0.5) * z;
    
    float t = u_time * u_speed * (1.0 + u_hover * 3.0); // Turbo mode on hover
    
    // Grid Logic
    float gridSize = 1.0;
    vec2 gridUV = vec2(x, z + t);
    vec2 grid = abs(fract(gridUV) - 0.5) * 2.0;
    float line = smoothstep(0.9, 0.95, max(grid.x, grid.y));
    
    // Fading into distance
    float fade = smoothstep(0.0, 1.0, y * 3.0);
    
    vec3 col = mix(vec3(0.0), u_color1, fade); // Base
    col += u_color2 * line * fade * (1.0 + u_hover); // Grid lines
    
    gl_FragColor = vec4(col * u_intensity, 1.0);
  }
`;

// Fragment Shader: Warp Speed
export const starFieldFragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_hover;

  ${noiseChunk}

  void main() {
    vec2 uv = vUv - 0.5;
    float t = u_time * u_speed;
    
    // Radial blur center
    vec3 col = vec3(0.0);
    
    float stretch = 1.0 + u_hover * 10.0; // Warp stretch factor
    
    for(float i=0.0; i<20.0; i++) {
        float z = fract(i * 0.05 - t * 0.5); // Depth
        float fade = smoothstep(0.0, 0.2, z) * smoothstep(1.0, 0.8, z);
        
        vec2 pos = (hash(vec2(i)) - 0.5) * 2.0;
        pos = pos / z;
        
        // Star shape (point vs line)
        vec2 dVec = (uv - pos);
        // Stretch based on distance from center and hover
        float d = length(dVec * vec2(1.0, 1.0/stretch)); 
        
        float star = 0.002 / d;
        star *= fade;
        
        col += mix(u_color1, u_color2, fract(i*0.1)) * star;
    }
    
    // Nebulae background
    float n = hash(uv + t * 0.1);
    col += u_color1 * n * 0.1;

    gl_FragColor = vec4(col * u_intensity, 1.0);
  }
`;

// Fragment Shader: Holographic
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
    
    // Simulate surface normals with noise
    float surf = sin(uv.x * 20.0 + t) * sin(uv.y * 20.0 - t * 1.5);
    
    // View angle shift
    vec2 viewDir = normalize(uv - 0.5);
    
    // Iridescence
    float angle = dot(viewDir, vec2(1.0));
    vec3 irid = 0.5 + 0.5 * cos(t + uv.xyx * 3.0 + vec3(0, 2, 4));
    
    // Scanline glitch
    float scan = smoothstep(0.4, 0.5, sin(uv.y * 100.0 + t * 5.0));
    
    // Hologram transparency flicker
    float alpha = 0.8 + 0.2 * sin(t * 10.0);
    
    // Mouse Interaction: Displace
    float d = distance(uv, u_mouse);
    float intf = smoothstep(0.3, 0.0, d) * u_hover;
    
    // Chromatic Aberration
    float r = sin(uv.x * 10.0 + surf + t) * u_color1.r;
    float g = sin(uv.x * 10.5 + surf + t) * u_color2.g;
    float b = sin(uv.x * 11.0 + surf + t);
    
    vec3 col = vec3(r,g,b) * alpha;
    
    // Add bright "specular" highlights
    col += vec3(1.0) * smoothstep(0.8, 0.9, surf) * 0.5;
    col += irid * 0.3 * u_hover;
    
    gl_FragColor = vec4(col * u_intensity + (intf * u_color2), 1.0);
  }
`;
