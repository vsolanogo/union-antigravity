
// Vertex Shader - Includes varyings for position to help with world-space effects
export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Common utility functions for high-end shaders
const commonChunks = `
  // Pseudo-random
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D Noise
  float noise(in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion
  #define OCTAVES 5
  float fbm(in vec2 st) {
      float value = 0.0;
      float amplitude = .5;
      float frequency = 0.;
      for (int i = 0; i < OCTAVES; i++) {
          value += amplitude * noise(st);
          st *= 2.;
          amplitude *= .5;
      }
      return value;
  }

  // Voronoi / Cellular noise
  vec2 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    vec2 mg, mr;
    float md = 8.0;
    for(int j=-1; j<=1; j++)
    for(int i=-1; i<=1; i++) {
        vec2 g = vec2(float(i),float(j));
        vec2 o = random(n + g) * vec2(0.5) + 0.5; // randomized offset
        o = 0.5 + 0.5*sin(6.2831*o); // animate
        vec2 r = g + o - f;
        float d = dot(r,r);
        if(d<md) {
            md = d;
            mr = r;
            mg = g;
        }
    }
    return vec2(md, mr);
  }
`;

export const infernalFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uPress;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    vec2 uv = vUv;
    
    // Domain warping for lava flow
    vec2 q = vec2(0.);
    q.x = fbm(uv + 0.00 * uTime);
    q.y = fbm(uv + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
    r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

    float f = fbm(uv + r);

    // Mouse heat interaction
    float mouseDist = distance(uv, uMouse);
    float heat = 1.0 - smoothstep(0.0, 0.5, mouseDist);
    
    // Color grading
    vec3 color = mix(vec3(0.1, 0.01, 0.0), vec3(0.7, 0.05, 0.0), clamp((f*f)*4.0, 0.0, 1.0));
    color = mix(color, vec3(0.9, 0.3, 0.0), clamp(length(q), 0.0, 1.0));
    color = mix(color, vec3(1.0, 0.8, 0.2), clamp(length(r.x), 0.0, 1.0));

    // Intensify on hover/press
    float brightness = 1.0 + uHover * 0.5 + uPress * 2.0 + heat * 0.5;
    vec3 finalColor = color * brightness;
    
    // Add "Ash" particles
    float spots = step(0.98, random(uv * 2.0 + floor(uTime * 5.0)));
    finalColor += vec3(spots * (0.5 + uHover));

    // Vignette
    float vig = 1.0 - pow(distance(uv, vec2(0.5)) * 1.5, 2.0);
    
    gl_FragColor = vec4(finalColor * vig, 1.0);
  }
`;

export const frostFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    vec2 uv = vUv;
    // Scale UV for voronoi
    vec2 st = uv * 3.0;
    
    // Animate voronoi
    // Add mouse influence to coordinate system
    vec2 mouseOffset = (uMouse - 0.5) * 0.2 * uHover;
    st += mouseOffset;
    
    vec2 c = voronoi(st + uTime * 0.1);
    
    // Crystal edges
    float crystals = c.x;
    // Sharpen
    crystals = smoothstep(0.0, 1.0, crystals);
    
    // Inner glow
    float glow = 1.0 - smoothstep(0.0, 0.5, distance(uv, uMouse));

    vec3 darkIce = vec3(0.0, 0.05, 0.1);
    vec3 lightIce = vec3(0.0, 0.5, 0.8);
    vec3 white = vec3(0.8, 0.9, 1.0);

    vec3 col = mix(darkIce, lightIce, smoothstep(0.2, 0.8, crystals));
    
    // Highlight edges
    float edge = 1.0 - smoothstep(0.05, 0.06, abs(crystals - 0.5));
    col += white * edge * 0.5;
    
    // Hover enhances brightness and refraction
    col += white * glow * uHover * 0.4;
    col += lightIce * uHover * 0.2;
    
    // Fake refraction/shine
    float shine = smoothstep(0.4, 0.6, uv.x + uv.y + sin(uTime));
    col += shine * 0.1;

    gl_FragColor = vec4(col, 0.9);
  }
`;

export const arcaneFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uPress;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Swirling black hole effect
    float t = uTime * 0.5;
    float distortion = sin(dist * 10.0 - t * 2.0);
    
    // Interaction warp
    vec2 mouseVec = uMouse - 0.5;
    float mouseInteract = 1.0 - smoothstep(0.0, 0.5, distance(vUv, uMouse));
    
    // Galaxy arms
    float arms = sin(angle * 3.0 + dist * 10.0 - t);
    float galaxy = fbm(uv * 3.0 + vec2(cos(t), sin(t)) * 0.2);
    
    vec3 voidColor = vec3(0.05, 0.0, 0.1);
    vec3 magicColor = vec3(0.6, 0.0, 0.8);
    vec3 coreColor = vec3(0.2, 0.8, 1.0);
    
    vec3 col = mix(voidColor, magicColor, smoothstep(0.2, 0.8, galaxy + arms * 0.2));
    
    // Singularity glow
    float core = 0.02 / (dist + 0.01);
    col += coreColor * core * (0.5 + uHover);
    
    // Particles/Stars
    float stars = step(0.97, random(vUv + t * 0.01));
    col += vec3(stars) * (1.0 + uPress * 5.0);
    
    // Shockwave on click
    float shock = 1.0 - smoothstep(0.0, 0.2 + uPress, abs(dist - uPress));
    col += coreColor * shock * uPress;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const stormFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    vec2 uv = vUv;
    
    // Background stormy clouds
    float clouds = fbm(uv * 2.0 + uTime * 0.2);
    
    // Dynamic Lightning
    // We create 'bolts' by taking absolute value of thin noise
    float t = uTime * 3.0;
    float boltNoise = fbm(vec2(uv.x * 1.0 + t, uv.y * 10.0));
    float bolt = 0.02 / abs(uv.x - 0.5 + (boltNoise - 0.5) * 0.5);
    
    // Mouse lightning
    float mouseBolt = 0.0;
    if (uHover > 0.0) {
        vec2 dir = uMouse - uv;
        float d = length(dir);
        float angle = atan(dir.y, dir.x);
        float mNoise = fbm(vec2(d * 5.0 - t * 2.0, angle));
        mouseBolt = 0.01 / abs(mNoise * 0.2);
        mouseBolt *= smoothstep(0.5, 0.0, d); // fade out
    }
    
    vec3 sky = vec3(0.05, 0.05, 0.15);
    vec3 cloudColor = vec3(0.2, 0.2, 0.4);
    vec3 elec = vec3(0.6, 0.8, 1.0);
    
    vec3 col = mix(sky, cloudColor, clouds);
    col += elec * bolt * (0.2 + random(vec2(uTime)) * 0.5); // flickering
    col += elec * mouseBolt * uHover;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const natureFragment = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    vec2 uv = vUv;
    
    // Organic vein movement
    float f = fbm(uv * 4.0 + vec2(0.0, uTime * 0.2));
    
    // Spores/Fireflies
    vec2 seed = uv + vec2(uTime * 0.1);
    float spores = step(0.98, random(floor(seed * 30.0)));
    
    // Mouse interaction - "Push" the spores away or light them up
    float dist = distance(uv, uMouse);
    float glow = 1.0 - smoothstep(0.0, 0.4, dist);
    
    vec3 deep = vec3(0.02, 0.1, 0.02);
    vec3 mid = vec3(0.1, 0.4, 0.1);
    vec3 bright = vec3(0.6, 0.9, 0.2);
    vec3 pollen = vec3(1.0, 0.9, 0.4);
    
    vec3 col = mix(deep, mid, f);
    
    // Add veins
    float veins = smoothstep(0.4, 0.45, f) - smoothstep(0.45, 0.5, f);
    col += bright * veins * 0.5;
    
    // Add spores
    col += pollen * spores * (sin(uTime * 5.0) * 0.5 + 1.0);
    
    // Mouse glow
    if (uHover > 0.0) {
        col += bright * glow * 0.6;
    }
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

// New Fog of War Background Shader
export const fogFragment = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 st = uv;
    st.x *= uResolution.x / uResolution.y;
    
    // Slow moving heavy fog
    float fog1 = fbm(st * 2.0 + uTime * 0.05);
    float fog2 = fbm(st * 4.0 - uTime * 0.02);
    
    float mixed = mix(fog1, fog2, 0.5);
    
    // Dark Dota-like colors
    vec3 bg = vec3(0.06, 0.07, 0.09); // Charcoal
    vec3 fogColor = vec3(0.15, 0.18, 0.22); // Slate
    vec3 highlight = vec3(0.2, 0.1, 0.1); // Subtle red hint
    
    vec3 col = mix(bg, fogColor, smoothstep(0.2, 0.8, mixed));
    
    // Dynamic shadows/clouds
    col *= 0.5 + 0.5 * fbm(st * 1.0 + vec2(uTime * 0.01));
    
    // Vignette
    float vig = 1.0 - length(uv - 0.5) * 1.2;
    col *= clamp(vig, 0.0, 1.0);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;
