
// Helper function for GLSL noise
const noiseFunctions = `
  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// --- EFFECT 1: KHERSON SHIELD (SCALED UP) ---
export const khersonWaveFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uClick;
  uniform vec2 uResolution;
  varying vec2 vUv;
  
  ${noiseFunctions}

  float hexDist(vec2 p) {
    p = abs(p);
    return max(dot(p, normalize(vec2(1.0, 1.73))), p.x);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 aspectUv = uv;
    aspectUv.x *= aspect;

    // Zoomed in grid (smaller multiplier = bigger shapes)
    vec2 gridUv = aspectUv * 5.0; 
    
    vec2 r = vec2(1.0, 1.73);
    vec2 h = r * 0.5;
    vec2 a = mod(gridUv, r) - h;
    vec2 b = mod(gridUv - h, r) - h;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    
    float hex = 1.0 - smoothstep(0.45, 0.5, hexDist(gv));
    
    vec3 blue = vec3(0.0, 0.4, 1.0);
    vec3 yellow = vec3(1.0, 0.8, 0.0);
    
    float noiseVal = snoise(uv * 2.0 + uTime * 0.2);
    vec3 bgColor = mix(blue * 0.5, yellow * 0.5, uv.x + noiseVal * 0.3);
    
    vec2 mouseAspect = uMouse;
    mouseAspect.x *= aspect;
    float distToMouse = distance(aspectUv, mouseAspect);
    float spotlight = smoothstep(0.6, 0.0, distToMouse);
    
    float ripple = 0.0;
    if (uClick > 0.0) {
        float waveDist = distance(aspectUv, mouseAspect);
        float wavePos = uClick * 2.0; 
        ripple = sin((waveDist - wavePos) * 15.0) * exp(-abs(waveDist - wavePos) * 4.0) * exp(-uClick * 2.0);
    }

    vec3 finalColor = bgColor * 0.3; 
    finalColor += vec3(hex) * (0.1 + uHover * 0.4 + spotlight * 0.4); 
    
    // Edges
    float edge = 1.0 - smoothstep(0.0, 0.05, hexDist(gv) - 0.45);
    finalColor += edge * mix(blue, yellow, sin(uTime + uv.x)) * (uHover * 1.5 + 0.5);

    finalColor += ripple * vec3(0.8, 0.9, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- EFFECT 2: TOXIC HAZARD (Legacy) ---
export const toxicSludgeFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;
  ${noiseFunctions}
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`;

// --- EFFECT 3: CYBER GRID (Legacy) ---
export const cyberPulseFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`;

// --- EFFECT 4: WATERMELON GLITCH (SCALED UP) ---
export const watermelonGlitchFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uClick;
  uniform vec2 uResolution;
  varying vec2 vUv;
  
  ${noiseFunctions}
  
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    
    float glitch = 0.0;
    if (uHover > 0.0) {
        float n = snoise(vec2(uv.y * 5.0, uTime * 8.0));
        glitch = step(0.7, n) * 0.05 * uHover;
    }
    
    vec2 distUv = uv;
    distUv.x += glitch;
    
    vec2 aspectDistUv = distUv;
    aspectDistUv.x *= aspect;

    // Bigger stripes (zoom in)
    float stripes = sin(aspectDistUv.x * 12.0 + snoise(aspectDistUv * 1.5) * 2.0);
    
    vec3 darkGreen = vec3(0.0, 0.25, 0.05);
    vec3 lightGreen = vec3(0.3, 0.7, 0.3);
    vec3 pulpRed = vec3(0.95, 0.15, 0.2);
    
    vec3 skin = mix(darkGreen, lightGreen, smoothstep(-0.4, 0.4, stripes));
    
    vec2 aspectUv = uv;
    aspectUv.x *= aspect;
    
    vec2 mouseAspect = uMouse;
    mouseAspect.x *= aspect;
    
    float d = distance(aspectUv, mouseAspect);
    float reveal = smoothstep(0.4 + uClick, 0.0, d) * uHover;
    
    // Zoomed in seeds
    float seeds = snoise(aspectUv * 15.0);
    vec3 inner = mix(pulpRed, vec3(0.1, 0.0, 0.0), step(0.65, seeds));
    
    vec3 color = mix(skin, inner, reveal + glitch * 3.0);
    
    float noiseOverlay = random(uv * uTime) * 0.05 * uHover;
    color += noiseOverlay;

    gl_FragColor = vec4(color, 1.0);
  }
`;