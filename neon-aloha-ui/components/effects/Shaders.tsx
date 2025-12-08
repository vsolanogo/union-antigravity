
/**
 * Vertex Shader
 * Standard pass-through.
 */
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Common GLSL Utils
 * High-performance noise and math functions.
 */
const glslUtils = `
  #define PI 3.14159265359

  // Hash function for noise
  float hash(vec2 p) {
      vec3 p3  = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
  }

  // Smooth Value Noise
  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix( mix( hash( i + vec2(0.0,0.0) ), 
                       hash( i + vec2(1.0,0.0) ), u.x),
                  mix( hash( i + vec2(0.0,1.0) ), 
                       hash( i + vec2(1.0,1.0) ), u.x), u.y);
  }

  // Fractal Brownian Motion with rotation
  float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = rot * p * 2.0;
          a *= 0.5;
      }
      return v;
  }
`;

/**
 * Fragment Shader: Waikiki (Hydro-Touch)
 * Interaction: Shockwave Distortion
 * The mouse physically pushes the water coordinates, creating a lensing effect.
 */
export const waveFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${glslUtils}

  // Iterative ripple function
  float ripples(vec2 p, float t) {
      vec2 p0 = p;
      for(int i = 1; i < 6; i++){
          p.x += 0.3 / float(i) * sin(float(i) * 3.0 * p.y + t * 2.0) + 1.0;
          p.y += 0.3 / float(i) * cos(float(i) * 3.0 * p.x + t * 1.5) + 1.0;
      }
      return 0.5 + 0.5 * sin(p.x * 2.0 + p.y * 2.0 + t);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);

    // Mouse Physics: Water Displacement
    vec2 mouse = (uMouse * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    vec2 dir = p - mouse;
    float dist = length(dir);
    // Create a repulsive shockwave force
    float force = 0.15 * smoothstep(0.6, 0.0, dist);
    // Bend the coordinates away from the mouse
    vec2 distP = p - normalize(dir) * force;

    // Time constant
    float t = uTime;

    // CHROMATIC ABERRATION LENSING
    // The force field also separates the colors
    vec2 offsetR = vec2(0.01 + force * 0.05, 0.0);
    vec2 offsetG = vec2(0.00, 0.00);
    vec2 offsetB = vec2(-0.01 - force * 0.05, 0.0);

    // Base scale
    distP *= 1.5;

    // Calculate intensity for each channel
    float r = ripples(distP + offsetR, t);
    float g = ripples(distP + offsetG, t * 1.01); 
    float b = ripples(distP + offsetB, t * 0.99); 

    // Sharpness curve
    r = pow(r, 4.0);
    g = pow(g, 4.0);
    b = pow(b, 4.0);

    // Compose colors
    vec3 col = vec3(0.0);
    col += uColor1 * b * 1.5; 
    col += uColor2 * g;       
    col += uColor3 * r * 0.8; 

    // Add "glitter" high frequency noise
    float sparkle = noise(p * 20.0 + t * 5.0);
    // Glitter gets intensified by the force field
    if(sparkle > 0.9) col += vec3(0.5 * force);

    // Deep ocean gradient background
    vec3 bg = mix(uColor1 * 0.2, uColor2 * 0.2, uv.y);
    col += bg;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Fragment Shader: Magma (Thermal Injector)
 * Interaction: Heat Brush
 * The mouse acts as a high-energy heat source, melting the crust and glowing white-hot.
 */
export const magmaFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${glslUtils}

  // Height map function
  float getHeight(vec2 p) {
      float t = uTime;
      float turbulence = 1.0; 
      
      // Domain warping
      vec2 q = vec2(fbm(p + t * 0.5), fbm(p + t));
      vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2)), fbm(p + 2.0 * q + vec2(8.3, 2.8)));
      
      return fbm(p * turbulence + 4.0 * r);
  }

  // Calculate normal vector from height map
  vec3 getNormal(vec2 p) {
      vec2 e = vec2(0.01, 0.0);
      float h = getHeight(p);
      vec3 n = vec3(
          getHeight(p + e.xy) - getHeight(p - e.xy),
          getHeight(p + e.yx) - getHeight(p - e.yx),
          0.1 
      );
      return normalize(n);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    
    // Mouse Physics: Heat Injection
    vec2 mouse = (uMouse * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    float heatDist = length(p - mouse);
    // Create a localized heat spot
    float heat = smoothstep(0.4, 0.0, heatDist);

    // 1. Get Height & Normal
    float h = getHeight(p * 2.0);
    vec3 normal = getNormal(p * 2.0);
    
    // 2. Lighting Setup
    vec3 lightPos = normalize(vec3(sin(uTime), cos(uTime), 1.0));
    float diff = max(dot(normal, lightPos), 0.0);
    
    // Specular
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 reflectDir = reflect(-lightPos, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); 

    // 3. Color Mapping
    // Mix base colors
    vec3 col = mix(uColor3, uColor1, smoothstep(0.2, 0.6, h)); 
    col = mix(col, uColor2, smoothstep(0.6, 0.9, h)); 
    
    // Apply heat injection: Make the lava physically brighter near mouse
    col += vec3(1.0, 0.8, 0.5) * heat * 1.5; 
    
    col *= (0.5 + diff); 
    col += vec3(1.0, 0.9, 0.5) * spec * 2.0; 
    
    float cracks = smoothstep(0.45, 0.4, h);
    col += uColor2 * cracks * 2.0; 

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Fragment Shader: Jungle Mist (Digital Void)
 * Interaction: Repulsion Field
 * The mouse pushes the Voronoi cells away, creating a clear path.
 */
export const mistFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${glslUtils}

  vec2 random2(vec2 p) {
      return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    
    // Mouse Physics: Repulsion
    vec2 mouse = (uMouse * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    vec2 dir = p - mouse;
    float d = length(dir);
    float push = smoothstep(0.6, 0.0, d);
    
    // Push coordinate space away from mouse
    vec2 st = p + normalize(dir) * push * 0.5;

    st *= 3.0; // Scale

    // Voronoi
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1.0; 
    vec2 m_point;

    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x),float(y));
            vec2 point = random2(i_st + neighbor);
            
            // Animate points
            point = 0.5 + 0.5*sin(uTime + 6.2831*point);
            
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);

            if( dist < m_dist ) {
                m_dist = dist;
                m_point = point;
            }
        }
    }

    vec3 color = mix(uColor3, uColor2, m_dist);
    float glow = 0.05 / max(m_dist, 0.0001); 
    
    // Interaction: Edges near the mouse glow brighter due to compression
    color += uColor1 * glow * (2.0 + push * 5.0);

    float pulse = sin(uTime * 2.0 - length(st)*2.0) * 0.5 + 0.5;
    color += uColor1 * pulse * 0.2;

    float scan = smoothstep(0.4, 0.5, sin(uv.y * 100.0 + uTime * 5.0));
    color += scan * 0.05;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Fragment Shader: Tiki Torch (Magnetic Core)
 * Interaction: Attractor
 * The mouse pulls the center of the interference pattern towards itself.
 */
export const tikiFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${glslUtils}

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    
    // Mouse Physics: Magnetic Pull
    vec2 mouse = (uMouse * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    // Shift the center of the gyroid pattern towards the mouse
    // The influence decays with distance (elastic pull)
    p -= mouse * 0.5; 

    float t = uTime;
    
    // Gyroid interference
    float v = 0.0;
    float scale = 8.0; 

    // Movement
    v += sin(p.x * scale + t);
    v += sin(p.y * scale - t * 1.2);
    v += sin((p.x + p.y) * scale * 0.7 + t * 1.5);
    v += cos(length(p) * scale * 1.5 - t * 2.0);

    // Normalize
    v = v * 0.25 + 0.5;
    
    // Sharpen bands
    float plasma = sin(v * 20.0 + t);
    plasma = smoothstep(0.2, 0.8, plasma);

    // Mask shape (Circular fade)
    // We adjust the mask so it follows the displaced center
    float r = length(p * vec2(1.0, 0.5)); 
    float mask = smoothstep(1.5, 0.0, r); // Increased range for full screen effect

    // Color mixing
    vec3 col = mix(uColor3, uColor2, v); 
    col = mix(col, uColor1, plasma);    
    
    // Hot core
    float core = smoothstep(0.8, 1.0, v * mask);
    col += vec3(1.0) * core;

    col *= mask;
    col += uColor2 * 0.1 * (1.0 - length(p));

    gl_FragColor = vec4(col, 1.0);
  }
`;