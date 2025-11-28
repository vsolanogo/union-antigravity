// Vertex Shader - Shared across all effects as we just need a simple plane
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Helper noise function for shaders
const noiseChunk = `
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

export const infernalFragment = `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  ${noiseChunk}

  void main() {
    vec2 uv = vUv;
    
    // Create rising heat effect
    float noise1 = snoise(uv * 3.0 + vec2(0.0, -uTime * 0.5));
    float noise2 = snoise(uv * 6.0 + vec2(0.0, -uTime * 0.8));
    
    float fire = noise1 * 0.6 + noise2 * 0.4;
    
    // Intensity increases with hover
    float intensity = 0.5 + (uHover * 0.5); 
    
    // Base dark red color
    vec3 baseColor = vec3(0.2, 0.0, 0.0);
    // Hot orange/yellow for the fire peaks
    vec3 fireColor = vec3(1.0, 0.4, 0.1) * smoothstep(0.3, 0.8, fire + intensity * 0.2);
    
    // Add a glowing rim effect
    float dist = distance(uv, vec2(0.5));
    float rim = smoothstep(0.6, 0.0, dist);
    
    vec3 finalColor = baseColor + fireColor;
    
    // Darken edges significantly
    finalColor *= smoothstep(0.8, 0.2, distance(uv, vec2(0.5)));
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const frostFragment = `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  ${noiseChunk}

  void main() {
    vec2 uv = vUv;
    
    // Angular crystalline movement
    float n = snoise(uv * 4.0 + vec2(cos(uTime * 0.2), sin(uTime * 0.1)));
    float n2 = snoise(uv * 10.0 - vec2(uTime * 0.2, 0.0));
    
    float ice = abs(n * n2); // Sharp edges
    
    vec3 deepBlue = vec3(0.05, 0.1, 0.3);
    vec3 brightCyan = vec3(0.4, 0.8, 1.0);
    vec3 white = vec3(1.0);
    
    float hoverBoost = uHover * 0.3;
    
    vec3 col = mix(deepBlue, brightCyan, smoothstep(0.0, 0.4 + hoverBoost, ice));
    col = mix(col, white, smoothstep(0.6, 0.8 + hoverBoost, ice));
    
    // Vignette
    float vig = 1.0 - smoothstep(0.2, 0.7, distance(uv, vec2(0.5)));
    
    gl_FragColor = vec4(col * vig, 1.0);
  }
`;

export const arcaneFragment = `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv - 0.5; // Center coords
    float d = length(uv);
    float a = atan(uv.y, uv.x);
    
    // Spiraling portal effect
    float spiral = sin(d * 20.0 - uTime * 2.0 + a * 5.0);
    float ring = abs(sin(d * 10.0 - uTime));
    
    vec3 purple = vec3(0.3, 0.0, 0.6);
    vec3 pink = vec3(1.0, 0.0, 0.8);
    vec3 black = vec3(0.0);
    
    float energy = smoothstep(0.2, 0.8, spiral) * ring;
    
    // Hover intensifies the core
    float core = 0.05 / (d + 0.01 - (uHover * 0.02)); 
    
    vec3 col = mix(purple, pink, energy);
    col += vec3(core * 0.5, core * 0.2, core * 0.8);
    
    // Box fade
    float box = smoothstep(0.5, 0.4, max(abs(uv.x), abs(uv.y)));
    
    gl_FragColor = vec4(col * box, 1.0);
  }
`;

export const stormFragment = `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  ${noiseChunk}

  void main() {
    vec2 uv = vUv;
    
    // Lightning bolts via high freq noise thresholds
    float t = uTime * 2.0;
    float n = snoise(vec2(uv.x * 20.0 + t, uv.y * 2.0));
    float bolt = 1.0 / abs(n * 20.0);
    
    // Background clouds
    float cloud = snoise(uv * 3.0 + t * 0.1);
    
    vec3 darkSky = vec3(0.1, 0.1, 0.2);
    vec3 lightning = vec3(0.6, 0.8, 1.0);
    
    float activity = clamp(bolt, 0.0, 1.0) * (0.5 + uHover * 1.5);
    
    vec3 col = mix(darkSky, lightning, activity);
    
    // Border glow
    float border = 1.0 - smoothstep(0.4, 0.5, max(abs(uv.x - 0.5), abs(uv.y - 0.5)));
    
    gl_FragColor = vec4(col * border, 1.0);
  }
`;

export const natureFragment = `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;
  
  ${noiseChunk}
  
  void main() {
    vec2 uv = vUv;
    
    // Flowing spores/leaves
    float flow = snoise(uv * 5.0 + vec2(0.0, uTime * 0.5));
    float mask = snoise(uv * 2.0 - uTime * 0.1);
    
    vec3 deepGreen = vec3(0.05, 0.2, 0.05);
    vec3 lightGreen = vec3(0.2, 0.8, 0.2);
    vec3 gold = vec3(0.8, 0.7, 0.1);
    
    float pattern = smoothstep(0.3, 0.7, flow * mask);
    
    vec3 col = mix(deepGreen, lightGreen, pattern);
    
    // Gold particles on hover
    if (uHover > 0.1) {
       float particle = snoise(uv * 50.0 + uTime);
       if (particle > 0.95) col = gold;
    }
    
    float vignette = 1.0 - smoothstep(0.2, 0.8, distance(uv, vec2(0.5)));
    
    gl_FragColor = vec4(col * vignette, 1.0);
  }
`;
