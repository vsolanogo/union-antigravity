
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * COMMON UTILS
 */
const noiseFunctions = `
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }
`;

/**
 * ROYAL GOLD SHADER (IMPERIAL)
 * Feature: Liquid Gold Surface, Specular Highlights, Embossed Borders, 17th Century Ornament feel
 */
export const royalGoldFragment = `
  uniform float time;
  uniform vec2 resolution;
  uniform float hover;
  uniform float clickTime;
  varying vec2 vUv;

  ${noiseFunctions}

  void main() {
    vec2 uv = vUv;
    float aspect = resolution.x / resolution.y;
    vec2 p = uv; 
    p.x *= aspect;

    // --- Dynamic Liquid Gold Surface ---
    // Domain warping
    vec2 q = vec2(fbm(p + time * 0.02), fbm(p + vec2(5.2, 1.3)));
    vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2) + 0.15*time), fbm(p + 4.0*q + vec2(8.3, 2.8) + 0.126*time));
    float f = fbm(p + 4.0*r);

    // Surface Normal estimation for lighting
    float h = f;
    vec2 eps = vec2(0.01, 0.0);
    float hx = fbm(p + eps.xy + 4.0*r) - h;
    float hy = fbm(p + eps.yx + 4.0*r) - h;
    vec3 normal = normalize(vec3(-hx * 5.0, -hy * 5.0, 1.0));

    // Lighting
    vec3 lightDir = normalize(vec3(sin(time)*0.5, cos(time)*0.5, 1.0));
    // Mouse interaction light
    if (hover > 0.0) {
        lightDir = normalize(mix(lightDir, vec3(0.0, 0.0, 1.0), hover));
    }
    
    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(reflect(-lightDir, normal), vec3(0.0,0.0,1.0)), 0.0), 32.0);

    // Gold Colors
    vec3 goldBase = vec3(0.7, 0.5, 0.1);
    vec3 goldDark = vec3(0.3, 0.2, 0.05);
    vec3 goldHighlight = vec3(1.0, 0.9, 0.5);

    vec3 col = mix(goldDark, goldBase, h);
    col += goldHighlight * spec * 0.8;
    col += goldBase * diff * 0.5;

    // --- Border Ornamentation ---
    vec2 b = abs(uv - 0.5) * 2.0;
    float dBox = max(b.x, b.y);
    
    // Pattern on border
    float pattern = smoothstep(0.4, 0.6, sin(uv.x * 60.0) * sin(uv.y * 60.0));
    float borderMask = smoothstep(0.85, 0.95, dBox);
    
    vec3 borderColor = mix(goldBase, goldHighlight, pattern * 0.5);
    col = mix(col, borderColor, borderMask);

    // Inner Glow on Hover
    col += goldHighlight * hover * 0.3 * (1.0 - dBox);

    // --- Shockwave ---
    float clickAge = time - clickTime;
    if (clickAge > 0.0 && clickAge < 1.0) {
        float waveDist = length(uv - 0.5);
        float wave = smoothstep(0.0, 0.05, abs(waveDist - clickAge * 1.5));
        col += vec3(1.0, 1.0, 0.8) * (1.0 - wave) * (1.0 - clickAge) * 2.0;
    }

    // Alpha vignette for shape
    float alpha = smoothstep(1.0, 0.98, dBox);

    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * ACADEMY SHADER (ENLIGHTENMENT / BLUEPRINT)
 * Feature: Star Chart, Constellation lines, Geometric Lattice, Deep Royal Blue
 */
export const cyberNeonFragment = `
  uniform float time;
  uniform vec2 resolution;
  uniform float hover;
  uniform float clickTime;
  varying vec2 vUv;

  // Hash function for stars
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;
    // Fix aspect ratio for the grid
    vec2 p = (uv - 0.5) * vec2(resolution.x/resolution.y, 1.0);
    
    // --- Deep Royal Blue / Parchment Ink Background ---
    vec3 bgCol = vec3(0.02, 0.05, 0.15); // Deep Blue
    vec3 gridCol = vec3(0.3, 0.4, 0.6);  // Faint Blue lines
    
    // --- Geometric Lattice (Latitude/Longitude) ---
    float scale = 8.0;
    vec2 gridUV = fract(p * scale) - 0.5;
    vec2 id = floor(p * scale);
    
    // Draw grid lines
    float dGrid = min(abs(gridUV.x), abs(gridUV.y));
    float lineMask = smoothstep(0.05, 0.0, dGrid);
    
    vec3 col = bgCol + gridCol * lineMask * 0.15;

    // --- Constellation Nodes (Stars) ---
    float sparkles = 0.0;
    // Iterate neighbor cells for connectivity
    for(float x=-1.0; x<=1.0; x++) {
      for(float y=-1.0; y<=1.0; y++) {
        vec2 offset = vec2(x, y);
        vec2 cellId = id + offset;
        
        // Random position in cell
        float n = hash21(cellId);
        vec2 pos = offset + vec2(sin(time * n * 0.5 + n * 10.0) * 0.4, cos(time * n * 0.3) * 0.4);
        
        // Distance to current pixel (relative to grid cell center)
        float d = length(gridUV - pos);
        
        // Draw star
        float star = 0.015 / d;
        sparkles += star * smoothstep(0.8, 1.0, sin(time * 5.0 + n * 100.0));
        
        // Draw connections to mouse if hovering
        if (hover > 0.0) {
           // Mouse position in grid space? 
           // Simpler: Just brighten center based on hover
           sparkles += star * hover * 2.0;
        }
      }
    }
    
    // Add stars to color (Silver/White)
    col += vec3(0.8, 0.9, 1.0) * sparkles * 0.5;

    // --- Lens/Optics Effect on Hover ---
    if (hover > 0.0) {
      // Vignette brighten center
      float dCenter = length(uv - 0.5);
      col += vec3(0.2, 0.4, 0.8) * hover * (1.0 - dCenter) * 0.5;
      
      // Moving scan line (Measurement)
      float scan = smoothstep(0.02, 0.0, abs(uv.y - 0.5 - sin(time * 2.0)*0.4));
      col += vec3(1.0) * scan * 0.2;
    }

    // --- Border (Fine Line) ---
    vec2 b = abs(uv - 0.5) * 2.0;
    float border = max(b.x, b.y);
    float borderLine = smoothstep(0.0, 0.02, abs(border - 0.95));
    // Invert to get line
    col += vec3(0.5, 0.7, 0.9) * (1.0 - borderLine) * 0.8;

    // --- Shockwave (Ripple) ---
    float clickAge = time - clickTime;
    if (clickAge > 0.0 && clickAge < 1.5) {
        float dist = length(p); // use aspect corrected p
        float ripple = sin(dist * 20.0 - clickAge * 10.0);
        float mask = smoothstep(1.0, 0.0, clickAge);
        float ring = smoothstep(0.1, 0.0, abs(dist - clickAge * 1.0));
        col += vec3(0.6, 0.8, 1.0) * ring * mask * 2.0;
    }
    
    // Crop
    float alpha = smoothstep(1.0, 0.98, border);

    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * BATTLE MIST SHADER (CHAOS/TACTICS)
 * Feature: Volumetric Fog, Burning Embers, Gunpowder Smoke, War Atmosphere
 */
export const mistFragment = `
  uniform float time;
  uniform vec2 resolution;
  uniform float hover;
  uniform float clickTime;
  varying vec2 vUv;

  ${noiseFunctions}

  void main() {
    vec2 uv = vUv;
    
    // --- Volumetric Smoke ---
    // Multiple layers of FBM moving at different speeds
    float smoke1 = fbm(uv * 3.0 + vec2(time * 0.1, time * 0.05));
    float smoke2 = fbm(uv * 5.0 + vec2(-time * 0.15, time * 0.1));
    float smoke = mix(smoke1, smoke2, 0.5);

    // Color Mapping
    vec3 colSmokeDark = vec3(0.1, 0.1, 0.12);
    vec3 colSmokeLight = vec3(0.4, 0.4, 0.45);
    vec3 colFire = vec3(1.0, 0.3, 0.05);
    vec3 colEmber = vec3(1.0, 0.8, 0.4);

    vec3 col = mix(colSmokeDark, colSmokeLight, smoke);

    // --- Embers / Sparks ---
    // High frequency noise threshold
    float sparks = fbm(uv * 10.0 + vec2(0.0, time * 1.5));
    // Mask sparks to appear more in the center or bottom
    float sparkMask = smoothstep(0.65, 0.8, sparks);
    col += colEmber * sparkMask * 5.0;

    // --- Burning Core (Hover) ---
    // When hovering, the smoke ignites
    float heat = fbm(uv * 4.0 - vec2(0.0, time * 0.5));
    col = mix(col, colFire, hover * smoothstep(0.4, 0.8, heat) * 1.5);

    // --- Card Shape Vignette ---
    vec2 b = abs(uv - 0.5) * 2.0;
    float border = max(b.x, b.y);
    
    // Soft transparent edges
    float alpha = smoothstep(0.2, 0.6, smoke) * 0.8 + 0.2;
    // Hard crop at button limits
    alpha *= smoothstep(1.0, 0.9, border);

    // Burning Edges
    float edgeBurn = smoothstep(0.85, 0.95, border);
    col += colFire * edgeBurn * (1.0 + sin(time * 10.0)) * 2.0;

    // --- Explosion Shockwave ---
    float clickAge = time - clickTime;
    if (clickAge > 0.0 && clickAge < 0.8) {
        float blastRadius = clickAge * 1.2;
        float dist = length(uv - 0.5);
        float blast = smoothstep(0.1, 0.0, abs(dist - blastRadius));
        col += colEmber * blast * 4.0 * (1.0 - clickAge);
    }

    gl_FragColor = vec4(col, alpha);
  }
`;
