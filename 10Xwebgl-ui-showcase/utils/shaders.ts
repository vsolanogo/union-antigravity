// Common noise functions
const noiseFunctions = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
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

export const basicVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Liquid Vertex Shader with Displacement
export const liquidVertexShader = `
  uniform float uTime;
  uniform float uHover;
  uniform float uPress;
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  ${noiseFunctions}

  void main() {
    vUv = uv;
    
    // Noise for displacement
    float t = uTime * 0.5;
    float noise = snoise(uv * 3.0 + vec2(t, t * 0.5));
    
    // Intensity increases with hover and press
    float intensity = 0.15 + (uHover * 0.4) + (uPress * 0.5);
    
    vec3 pos = position;
    // Displace along Z
    float displacement = noise * intensity;
    pos.z += displacement;
    
    vDisplacement = displacement;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalMatrix * normal;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const neonFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform float uPress;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;

  float roundedBoxSDF(vec2 CenterPosition, vec2 Size, float Radius) {
      return length(max(abs(CenterPosition)-Size+Radius,0.0))-Radius;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 2.0; 
    
    float pulse = sin(uTime * 4.0) * 0.5 + 0.5;
    
    float d = roundedBoxSDF(p, vec2(1.8, 0.8), 0.2);
    
    float glowSize = 0.05 + (uHover * 0.05) + (uPress * 0.1);
    float glowIntensity = 1.0 + (uHover * 1.5) + (uPress * 4.0);
    
    // Electric arc noise
    float noise = fract(sin(dot(vUv + uTime, vec2(12.9898, 78.233))) * 43758.5453);
    float spark = step(0.98, noise) * uHover;

    float glow = glowSize / abs(d);
    glow = pow(glow, 1.5);
    glow *= glowIntensity;
    
    float fillAlpha = smoothstep(0.0, -0.05, d) * (0.05 + uHover * 0.2 + uPress * 0.4);
    float scanline = sin(vUv.y * 120.0 - uTime * 10.0) * 0.05;
    
    float rippleRadius = uPress * 4.0; 
    float rippleDist = length(p);
    float ripple = smoothstep(rippleRadius - 0.2, rippleRadius, rippleDist) * (1.0 - smoothstep(rippleRadius, rippleRadius + 0.2, rippleDist));
    
    vec3 col = mix(uColor1, uColor2, vUv.x + sin(uTime));
    vec3 finalColor = col * (glow + ripple * 5.0 + spark * 2.0);
    float alpha = clamp(glow + fillAlpha + scanline, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const liquidFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform float uPress;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // Reconstruct normal based on derivatives for sharper lighting
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel effect
    float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
    
    // Fake Environment Reflection (Chrome-like)
    vec3 ref = reflect(-viewDir, normal);
    float env = sin(ref.x * 10.0 + uTime) * sin(ref.y * 10.0 + uTime) * 0.5 + 0.5;
    
    // Base gradient
    vec3 baseColor = mix(uColor1, uColor2, vDisplacement * 2.0 + 0.5);
    
    // Highlight
    float light = 0.5 + vDisplacement * 2.0;
    float specular = smoothstep(0.4, 0.6, light + env * 0.2) * (1.0 + uHover);
    
    // Combine
    vec3 finalColor = baseColor * (0.5 + env * 0.5) + vec3(specular) + (vec3(fresnel) * uColor2);
    
    // Glint on press
    finalColor += vec3(uPress * 0.8);

    float dist = length(vUv - 0.5);
    float edge = 1.0 - smoothstep(0.4, 0.5, dist);
    
    gl_FragColor = vec4(finalColor, edge);
  }
`;

export const holographicFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform float uPress;
  uniform vec3 uColor1;
  varying vec2 vUv;

  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    float glitchTrigger = sin(uTime * 10.0) > 0.9 ? 1.0 : 0.0;
    float glitchOffset = (rand(vec2(uTime, floor(vUv.y * 10.0))) - 0.5) * 0.1 * glitchTrigger * (0.2 + uHover);
    
    vec2 uv = vUv;
    uv.x += glitchOffset;
    
    float grid = step(0.95, fract(uv.x * 20.0)) + step(0.95, fract(uv.y * 10.0));
    float bar = smoothstep(0.4, 0.5, fract(uv.y - uTime * 0.5)) * smoothstep(0.6, 0.5, fract(uv.y - uTime * 0.5));
    
    float alpha = 0.1 + (uHover * 0.2) + bar * 0.2 + grid * 0.1;
    
    vec2 d = abs(uv - 0.5) * 2.0;
    float border = step(0.9, max(d.x, d.y));
    
    vec3 color = uColor1 + vec3(grid * 0.5) + vec3(bar);
    color += vec3(uPress);
    
    gl_FragColor = vec4(color, alpha * (0.5 + border) + uPress * 0.5);
  }
`;

// --- NEW WARP SHADERS ---

export const warpVertexShader = `
  uniform float uTime;
  uniform float uSpeed; // Controls the stretch
  attribute float aSize;
  attribute float aSpeed;
  attribute vec3 aRandom;
  varying float vAlpha;
  
  void main() {
    vec3 pos = position;
    
    // Move particles towards camera Z
    // Loop them in Z space [ -10, 10 ]
    float z = mod(pos.z + uTime * (aSpeed + uSpeed * 20.0), 20.0) - 10.0;
    pos.z = z;
    
    // Streak effect: Stretch 'tail' based on speed
    // We visualize this by scaling point size or drawing lines. 
    // Here we use Points, so visual trickery in fragment or simple Z motion.
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuates with distance
    gl_PointSize = aSize * (10.0 / -mvPosition.z);
    
    // Fade out when too close or too far
    vAlpha = smoothstep(-10.0, -8.0, z) * (1.0 - smoothstep(5.0, 10.0, z));
  }
`;

export const warpFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uSpeed;
  varying float vAlpha;
  
  void main() {
    // Circular particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Color shift based on speed (Redshift/Blueshift)
    vec3 color = mix(uColor1, uColor2, uSpeed);
    
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 2.0);
    
    gl_FragColor = vec4(color, vAlpha * glow);
  }
`;

// --- NEW CYBER GLYPH SHADERS ---

export const glyphVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vNormal = normal;
    
    vec3 pos = position;
    // Twist effect
    float angle = pos.y * 2.0 + uTime;
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    pos.xz = rot * pos.xz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const glyphFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform float uPress;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    float stripes = sin(vUv.y * 40.0 + uTime * 5.0);
    float glow = smoothstep(0.8, 1.0, stripes);
    
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
    rim = pow(rim, 3.0);
    
    // Decrypting logic (random noise blocks)
    float noise = step(0.5, fract(sin(dot(vUv * 10.0, vec2(12.9, 78.2))) * 43758.5));
    float decrypt = mix(noise, 1.0, uHover); // Becomes solid on hover
    
    vec3 col = mix(uColor1, uColor2, rim);
    col += vec3(glow * uHover);
    col += vec3(uPress);
    
    float alpha = (rim + glow * 0.5 + 0.1) * decrypt;
    
    gl_FragColor = vec4(col, alpha);
  }
`;
