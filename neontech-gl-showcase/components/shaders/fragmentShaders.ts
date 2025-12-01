
/* 
  ------------------------------------------------------------------
  CORE UTILITIES 
  High-performance noise and math functions shared across shaders
  ------------------------------------------------------------------
*/
const commonUniforms = `
  uniform float time;
  uniform float hover;
  uniform vec2 uMouse;
  uniform vec2 resolution;
  varying vec2 vUv;
`;

const utils = `
  #define PI 3.14159265359
  
  // Rotation matrix
  mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
  }

  // 3D Noise
  float random(vec3 st) {
      return fract(sin(dot(st.xyz, vec3(12.9898,78.233,45.543))) * 43758.5453123);
  }
  
  // Smooth min function for organic blending of SDFs
  float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
      return mix(b, a, h) - k*h*(1.0-h);
  }
`;

/* 
  ------------------------------------------------------------------
  SHADER 1: NEON PULSE (Raymarched Reactive Core)
  Technique: Signed Distance Fields (SDF) + Raymarching
  ------------------------------------------------------------------
*/
export const neonFragment = `
  ${commonUniforms}
  ${utils}

  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  }

  float map(vec3 p) {
    vec3 p1 = p;
    p1.xz *= rot(time * 0.5);
    p1.xy *= rot(time * 0.3);
    
    // Mouse influence deform
    float mouseDist = length(p.xy - uMouse * 2.0);
    float deform = smoothstep(2.0, 0.0, mouseDist) * hover * 0.5;
    
    // Morphing box to sphere
    float box = sdBox(p1, vec3(0.6));
    float sphere = length(p1) - 0.7;
    float d = mix(box, sphere, 0.5 + sin(time) * 0.5);
    
    // Pulse effect
    d -= 0.02 * sin(10.0 * p.x + time * 5.0);
    
    return d;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Camera setup
    vec3 ro = vec3(0.0, 0.0, 3.0); // Origin
    vec3 rd = normalize(vec3(uv, -1.5)); // Direction
    
    // Raymarch
    float t = 0.0;
    float d = 0.0;
    vec3 p = vec3(0.0);
    
    for(int i = 0; i < 64; i++) {
        p = ro + rd * t;
        d = map(p);
        t += d;
        if(d < 0.001 || t > 10.0) break;
    }
    
    // Coloring based on distance and normal
    vec3 col = vec3(0.0);
    
    if(t < 10.0) {
        // Simple normal calculation
        vec2 e = vec2(0.01, 0.0);
        vec3 normal = normalize(vec3(
            map(p + e.xyy) - map(p - e.xyy),
            map(p + e.yxy) - map(p - e.yxy),
            map(p + e.yyx) - map(p - e.yyx)
        ));
        
        vec3 light = normalize(vec3(uMouse.x, uMouse.y, 1.0));
        float diff = max(dot(normal, light), 0.0);
        
        // Neon palette
        vec3 base = vec3(0.1, 0.0, 0.2);
        vec3 glow = vec3(0.0, 0.8, 1.0);
        vec3 hot = vec3(1.0, 0.2, 0.5);
        
        col = base + glow * diff + hot * pow(diff, 4.0) * hover;
        
        // Rim light
        float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
        col += vec3(0.5, 0.8, 1.0) * fresnel;
    }
    
    // Ambient Glow
    col += vec3(0.1, 0.0, 0.3) * (1.0 / length(uv)); 

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* 
  ------------------------------------------------------------------
  SHADER 2: MATRIX DATA (Volumetric Digital Rain)
  Technique: Layered parallax UV scrolling
  ------------------------------------------------------------------
*/
export const matrixFragment = `
  ${commonUniforms}
  
  float text(vec2 uv, float speed) {
      vec2 grid = vec2(30.0, 10.0);
      vec2 ipos = floor(uv * grid);
      
      float noise = sin(ipos.x * 12.9898 + ipos.y * 78.233);
      float drop = fract(noise * 43758.5453 + time * speed);
      
      // Binary chars look (simplified)
      vec2 fpos = fract(uv * grid);
      float char = step(0.5, fract(noise * 10.0 + fpos.x * fpos.y));
      
      // Trail
      float trail = smoothstep(0.9, 0.0, drop);
      // Head
      float head = smoothstep(0.95, 1.0, drop);
      
      return char * (trail * 0.5 + head);
  }

  void main() {
    vec2 uv = vUv;
    
    // 3 Layers for depth
    float layer1 = text(uv, 1.0);
    float layer2 = text(uv * 1.5 + vec2(0.2), 0.8) * 0.5;
    float layer3 = text(uv * 0.8 - vec2(0.3), 1.2) * 0.3;
    
    float mask = layer1 + layer2 + layer3;
    
    // Digital Green Palette
    vec3 color = vec3(0.0, 1.0, 0.4) * mask;
    
    // Mouse Interaction: Disrupt/Brighten
    float dist = distance(vUv * 2.0 - 1.0, uMouse);
    float disrupt = smoothstep(0.5, 0.0, dist) * hover;
    
    color += vec3(0.8, 1.0, 0.8) * disrupt * mask * 2.0;
    
    // Background fade
    vec3 bg = vec3(0.01, 0.02, 0.01);
    
    gl_FragColor = vec4(bg + color, 1.0);
  }
`;

/* 
  ------------------------------------------------------------------
  SHADER 3: LIQUID METAL (Iridescent Domain Warping)
  Technique: FBM (Fractal Brownian Motion) with coordinate distortion
  ------------------------------------------------------------------
*/
export const liquidFragment = `
  ${commonUniforms}
  ${utils}

  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    mat2 m = rot(0.5);
    for(int i=0; i<4; i++) {
        val += amp * sin(p.x * 5.0 + p.y * 4.0 + time);
        p = m * p * 2.0;
        amp *= 0.5;
    }
    return val;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Mouse deform
    vec2 p = uv;
    float dMouse = length(uv - uMouse);
    p += (uv - uMouse) * smoothstep(0.5, 0.0, dMouse) * hover * 0.3;

    // Domain Warping
    vec2 q = vec2(0.0);
    q.x = fbm(p + vec2(0.0, 0.0));
    q.y = fbm(p + vec2(5.2, 1.3));

    vec2 r = vec2(0.0);
    r.x = fbm(p + 4.0*q + vec2(1.7, 9.2) + 0.15*time);
    r.y = fbm(p + 4.0*q + vec2(8.3, 2.8) + 0.126*time);

    float f = fbm(p + 4.0*r);

    // Color mixing (Iridescence)
    vec3 col = mix(vec3(0.1, 0.0, 0.2), vec3(0.0, 0.1, 0.3), clamp(f*f*4.0, 0.0, 1.0));
    col = mix(col, vec3(0.0, 1.0, 0.8), clamp(length(q), 0.0, 1.0));
    col = mix(col, vec3(1.0, 1.0, 1.0), clamp(length(r.x), 0.0, 1.0));

    // Specular highlight based on gradient
    float grad = length(vec2(dFdx(f), dFdy(f)));
    col += vec3(1.0) * smoothstep(0.1, 0.2, grad) * 0.5;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* 
  ------------------------------------------------------------------
  SHADER 4: CYBER GRID (Infinite Retroscape)
  Technique: 3D Plane Projection with moving texture
  ------------------------------------------------------------------
*/
export const gridFragment = `
  ${commonUniforms}
  
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Fake 3D projection
    float horizon = -0.2;
    float fov = 0.5;
    
    // Pitch view based on mouse Y
    float pitch = 0.5 + uMouse.y * 0.2 * hover;
    
    // Coordinate mapping
    float z = 1.0 / (abs(uv.y - horizon));
    vec2 gridUV = vec2(uv.x * z * fov, z + time * 2.0);
    
    // Curvature
    gridUV.x += sin(z * 0.5 + time) * 0.5;

    // Grid Lines
    vec2 grid = fract(gridUV * 2.0) - 0.5;
    float line = length(grid) - 0.4;
    float aa = fwidth(line);
    float val = 1.0 - smoothstep(0.0, 0.1, abs(line));
    
    // Fade into horizon
    float fog = smoothstep(5.0, 0.0, z);
    
    vec3 col = vec3(0.0);
    
    // Grid color
    vec3 lineCol = vec3(1.0, 0.2, 0.8); // Magenta
    vec3 fillCol = vec3(0.1, 0.0, 0.3); // Deep Purple
    
    if (uv.y > horizon) {
        // Sky
        col = vec3(0.05, 0.0, 0.1);
        // Sun
        float sun = length(uv - vec2(0.0, 0.4 + uMouse.y * 0.1));
        col += vec3(1.0, 0.5, 0.0) * smoothstep(0.3, 0.2, sun);
    } else {
        // Ground
        col = mix(fillCol, lineCol, val) * fog;
        
        // Mouse spotlight on ground
        float spot = 1.0 / length(vec2(uv.x, uv.y*2.0) - vec2(uMouse.x, -0.5));
        col += vec3(0.0, 1.0, 1.0) * spot * hover * 0.2;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* 
  ------------------------------------------------------------------
  SHADER 5: PLASMA VOID (High Energy Turbulence)
  Technique: Multi-layered Sine waves
  ------------------------------------------------------------------
*/
export const plasmaFragment = `
  ${commonUniforms}
  
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    vec2 p = uv;
    float t = time * 0.5;
    
    // Rotate entire field based on mouse
    float ang = uMouse.x * hover;
    float s = sin(ang), c = cos(ang);
    p *= mat2(c, -s, s, c);
    
    vec3 color = vec3(0.0);
    
    for(float i = 1.0; i < 4.0; i++) {
        p.x += 0.3 / i * sin(i * 3.0 * p.y + t);
        p.y += 0.3 / i * cos(i * 3.0 * p.x + t);
        
        float val = length(p);
        
        // Palette
        color.r += 0.5 * sin(val * 10.0 + t) + 0.5;
        color.g += 0.5 * sin(val * 12.0 + t + 2.0) + 0.5;
        color.b += 0.5 * sin(val * 14.0 + t + 4.0) + 0.5;
    }
    
    color /= 3.0;
    
    // Contrast boost
    color = pow(color, vec3(2.0));
    
    // Dark void center
    float d = length(uv);
    color *= smoothstep(1.5, 0.2, d);
    
    // Hot center
    color += vec3(1.0, 0.8, 0.5) * (1.0 / (d * 10.0 + 1.0));

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* 
  ------------------------------------------------------------------
  SHADER 6: HOLO INTERFERENCE (Fresnel Glitch)
  Technique: Fresnel on noise + scanline displacements
  ------------------------------------------------------------------
*/
export const holoFragment = `
  ${commonUniforms}
  ${utils}

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Glitch Displacement
    float glitch = step(0.98, random(vec3(time, uv.y, 0.0)));
    uv.x += glitch * 0.1 * sin(time * 10.0);
    
    // Shape: Torus-like distance field visual
    float r = length(uv) * 2.0;
    float a = atan(uv.y, uv.x);
    
    float f = cos(a * 3.0 + time) * 0.1 + sin(r * 10.0 - time * 2.0) * 0.05;
    
    float shape = abs(r - 1.0 + f) - 0.1;
    float edge = 1.0 - smoothstep(0.0, 0.1, shape);
    
    // Hologram Lines
    float scan = sin(vUv.y * 100.0 + time * 5.0) * 0.5 + 0.5;
    
    vec3 col = vec3(0.0);
    
    // Colors
    vec3 holoCol = vec3(0.0, 1.0, 0.8);
    vec3 interactCol = vec3(1.0, 0.0, 0.5);
    
    col = holoCol * edge;
    col += holoCol * scan * 0.2;
    
    // Mouse Interaction
    float mDist = length(uv - uMouse);
    float reveal = 1.0 / (mDist * 2.0 + 0.1);
    
    col += interactCol * reveal * hover * 0.5;
    
    // Add noise grain
    col += (random(vec3(uv, time)) - 0.5) * 0.1;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
