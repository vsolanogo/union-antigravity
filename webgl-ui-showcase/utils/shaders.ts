// Vertex shader is generally shared for basic plane effects
export const basicVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const neonFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;

  void main() {
    // Distance from center
    vec2 center = vUv - 0.5;
    float dist = length(center);
    
    // Create a pulsing glow ring
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    float ring = smoothstep(0.4, 0.45 + (uHover * 0.05), dist) - smoothstep(0.45 + (uHover * 0.05), 0.5, dist);
    
    // Scanline effect
    float scanline = sin(vUv.y * 50.0 - uTime * 5.0) * 0.1;
    
    // Background fill with hover intensity
    float fill = smoothstep(0.5, 0.0, dist) * (0.1 + uHover * 0.4);
    
    // Color mixing
    vec3 color = mix(uColor1, uColor2, vUv.x + sin(uTime));
    
    float alpha = ring + fill + scanline;
    alpha = clamp(alpha, 0.0, 1.0);
    
    // Hard edge for button shape
    float shape = 1.0 - smoothstep(0.48, 0.5, dist);
    
    gl_FragColor = vec4(color * 2.0, alpha * shape);
  }
`;

export const liquidFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;

  // Simplex noise function (simplified for brevity)
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

  void main() {
    float noiseScale = 3.0 + (uHover * 2.0);
    float timeSpeed = uTime * (0.5 + uHover);
    
    float n = snoise(vUv * noiseScale + timeSpeed);
    
    // Distort UVs
    vec2 distortedUv = vUv + n * 0.1;
    
    float dist = length(distortedUv - 0.5);
    float alpha = smoothstep(0.5, 0.45, dist);
    
    vec3 color = mix(uColor1, uColor2, n * 0.5 + 0.5);
    
    // Add shine
    float shine = smoothstep(0.4, 0.6, n) * uHover;
    
    gl_FragColor = vec4(color + shine, alpha);
  }
`;

export const holographicFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor1;
  varying vec2 vUv;

  void main() {
    float y = vUv.y;
    
    // Glitch lines
    float glitch = step(0.98, fract(y * 10.0 + uTime * 2.0));
    
    // Hologram gradient
    float hologram = sin(y * 100.0 + uTime * 5.0) * 0.1;
    
    // Border
    vec2 borderDist = abs(vUv - 0.5);
    float border = step(0.48, max(borderDist.x, borderDist.y));
    
    float alpha = (0.2 + uHover * 0.3) + hologram + glitch;
    alpha += border * (0.5 + sin(uTime * 10.0) * 0.5);
    
    // Corner accents
    float corner = step(0.4, max(borderDist.x, borderDist.y)) * step(0.4, min(borderDist.x, borderDist.y)); // Simplification
    
    vec3 color = uColor1 + vec3(hologram);
    
    gl_FragColor = vec4(color, alpha * step(0.0, 1.0 - length(vUv - 0.5) * 0.0)); // Rectangular mask logic handled by mesh usually, but here opacity
  }
`;
