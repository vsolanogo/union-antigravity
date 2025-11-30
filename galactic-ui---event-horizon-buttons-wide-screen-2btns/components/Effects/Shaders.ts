
// Vertex Shader - Standard Pass-through
export const commonVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment - Black Hole Accretion Disk
export const accretionDiskFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  uniform float uHover;
  
  varying vec2 vUv;

  // Pseudo-random function
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  // Noise function
  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
      mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res*res;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv) * 2.0; 
    float angle = atan(uv.y, uv.x);
    
    // Animation Speed
    float t = uTime * 2.0 + (uHover * uTime * 5.0);
    
    // Spiral swirl using noise
    float swirl = noise(vec2(r * 5.0 - t, angle * 2.0 + r));
    
    // Main disk shape with soft edges
    float disk = smoothstep(0.2, 0.25, r) * smoothstep(1.0, 0.6, r);
    
    // Relativistic Beaming (Doppler): One side is brighter as if moving towards viewer
    float doppler = 0.5 + 0.5 * sin(angle - 1.0); 
    
    // Color mixing
    vec3 color = mix(uColorOuter, uColorInner, r * 1.2);
    color += vec3(swirl) * 0.5; // Add texture
    color *= (0.8 + doppler * 0.4); // Apply doppler
    
    // Bright inner Photon Ring
    float photonRing = smoothstep(0.25, 0.28, r) * smoothstep(0.31, 0.28, r);
    color += vec3(1.0, 0.9, 0.8) * photonRing * 3.0;
    
    // Heat up on hover
    if (uHover > 0.0) {
        color = mix(color, vec3(1.0, 0.5, 0.2), uHover * 0.5);
    }
    
    float alpha = disk * (0.8 + swirl * 0.2);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Fragment - Supernova Energy Field
export const energyShieldFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHover;
  
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDir, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    
    float pulse = sin(uTime * 5.0) * 0.5 + 0.5;
    float intensity = pow(fresnel, 3.0);
    
    // Voronoi-like pattern for energy lattice
    float grid = sin(vPosition.x * 20.0 + uTime) * sin(vPosition.y * 20.0 - uTime) * sin(vPosition.z * 20.0);
    
    vec3 glow = uColor * intensity * 3.0;
    glow += uColor * grid * 0.2;
    
    if(uHover > 0.0) {
        glow += vec3(1.0, 1.0, 1.0) * pulse * uHover; // Flash white on hover
    }
    
    gl_FragColor = vec4(glow, intensity * (0.4 + 0.6 * uHover));
  }
`;

// Fragment - Nebula Cloud
export const nebulaCloudFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorCore;
  uniform vec3 uColorMist;
  varying vec2 vUv;
  
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
      mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res*res;
  }
  
  // Fractional Brownian Motion
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    
    // Moving fog
    float t = uTime * 0.2;
    float fog = fbm(uv * 3.0 + vec2(t, t * 0.5));
    
    // Color Gradient
    vec3 color = mix(uColorMist, uColorCore, fog * 1.5);
    
    // Soft circle mask
    float alpha = (1.0 - smoothstep(0.3, 0.5, r)) * fog;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
