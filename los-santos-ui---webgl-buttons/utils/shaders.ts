

// ==========================================
// SHARED UTILS (NOISE & MATH)
// ==========================================

const commonShaderPart = `
  // Pseudo-random function
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // 2D Noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal Brownian Motion (Smoke/Clouds)
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + vec2(100.0);
      a *= 0.5;
    }
    return v;
  }
`;

// ==========================================
// VERTEX SHADERS
// ==========================================

export const basicVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Advanced Terrain Grid Vertex
export const gridVertexShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vElevation;
  uniform float uTime;

  // Simple 3D Noise for terrain movement
  // (Replaced broken snoise function)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  // Simplified Perlin-like
  float terrain(vec2 p) {
    float h = 0.0;
    // Valley in the center (0.5), mountains on sides
    float valley = abs(p.x - 0.5);
    valley = smoothstep(0.1, 0.8, valley);
    
    // Mountain noise
    // Combine Sin waves with Simplex Noise for detail
    h += sin(p.y * 5.0 + uTime * 0.5) * 0.2;
    h += snoise(vec3(p.x * 5.0, p.y * 5.0, uTime * 0.2)) * 0.3;
    
    return valley * 4.0 * (1.0 + h); // Height multiplier
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Create the "Synthwave Valley" effect
    // We displace Z because the plane is rotated -90deg X, so local Z is World Y (Up)
    float el = terrain(uv);
    pos.z += el; 
    
    vElevation = el;
    vPos = pos;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ==========================================
// FRAGMENT SHADERS
// ==========================================

// 1. ADVANCED NEON (Smoke & Plasma)
export const neonFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHover;
  uniform vec2 uResolution;
  varying vec2 vUv;
  
  ${commonShaderPart}

  void main() {
    vec2 uv = vUv;
    // Aspect ratio correction for smoke shape
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    // Border Glow
    float d = abs(uv.x - 0.5) * 2.0;
    float d2 = abs(uv.y - 0.5) * 2.0;
    float border = max(d, d2);
    float glow = smoothstep(0.8, 1.0, border);
    glow += smoothstep(0.95, 1.0, border) * 10.0; // Hot edges

    // Smoke Simulation
    float time = uTime * (0.5 + uHover * 2.0); // Speed up on hover
    
    // Domain warping
    vec2 q = vec2(0.);
    q.x = fbm( p + 0.00*time );
    q.y = fbm( p + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( p + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
    r.y = fbm( p + 1.0*q + vec2(8.3,2.8)+ 0.126*time);

    float f = fbm(p+r);

    // Color mixing
    vec3 col = mix(vec3(0.0), uColor, clamp((f*f)*4.0,0.0,1.0));
    col = mix(col, vec3(1.0), clamp(length(q),0.0,1.0));
    col = mix(col, vec3(0.1, 0.0, 0.3), clamp(length(r.x),0.0,1.0));

    // Mask smoke to inside
    float inside = 1.0 - smoothstep(0.9, 1.0, border);
    col *= inside * (0.5 + uHover);

    // Combine Border + Smoke
    vec3 finalColor = col + (uColor * glow * (0.5 + uHover));
    
    // Add noise grain
    finalColor += (hash(uv * uTime) - 0.5) * 0.1;

    gl_FragColor = vec4(finalColor, border * 0.8 + inside * (0.2 + f * 0.5));
  }
`;

// 2. ADVANCED WANTED (Police Light Bar Physics)
export const wantedFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uResolution;
  varying vec2 vUv;

  ${commonShaderPart}

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    float aspect = uResolution.x / uResolution.y;
    p.x *= aspect;

    // Base dark metal
    vec3 color = vec3(0.05);

    // Rotation logic for lights
    float speed = 5.0 + uHover * 15.0;
    float angle = uTime * speed;
    
    // Light sources positions (simulating a light bar)
    // We create a rotating gradient
    float rot = atan(p.y, p.x); // Polar angle
    
    // Red Light Phase
    float redPhase = sin(rot + angle);
    float redBeam = smoothstep(0.8, 1.0, redPhase);
    
    // Blue Light Phase (Offset by PI)
    float bluePhase = sin(rot + angle + 3.14159);
    float blueBeam = smoothstep(0.8, 1.0, bluePhase);
    
    // Intensity dropoff from center
    // EXTENDED RANGE: Dynamic falloff based on aspect ratio so it fills wide buttons
    float dist = length(p);
    float maxDist = max(1.5, aspect * 1.5); 
    float beamIntensity = smoothstep(maxDist, 0.0, dist); 
    
    // Volumetric adds
    vec3 red = vec3(1.0, 0.05, 0.05) * redBeam * beamIntensity;
    vec3 blue = vec3(0.05, 0.05, 1.0) * blueBeam * beamIntensity;
    
    // Strobe flash (center burst)
    float strobe = step(0.8, sin(uTime * 20.0));
    vec3 white = vec3(1.0) * strobe * beamIntensity * uHover;

    color += red * 2.0 + blue * 2.0 + white;

    // Scanlines (police tape style)
    float scan = step(0.5, sin(uv.y * 100.0 + uTime * 5.0));
    color *= 0.8 + 0.2 * scan;
    
    // Vignette
    float vig = 1.0 - smoothstep(maxDist * 0.5, maxDist, length(p));
    color *= vig;
    
    float alpha = 0.8 + (redBeam + blueBeam) * 0.2;

    gl_FragColor = vec4(color, alpha);
  }
`;

// 3. ADVANCED MONEY (Guilloche Pattern & Gold Specular)
export const moneyFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Guilloche Pattern (Banknote style intricate curves)
    // Scale coords
    vec2 p = uv * 20.0;
    float t = uTime * 2.0;
    
    // Complex sinusoidal interference
    float val = sin(p.x + sin(p.y + t*0.1)) + 
                sin(p.y + sin(p.x + t*0.1)) + 
                sin(p.x + p.y + t);
                
    float guilloche = smoothstep(0.0, 0.1, abs(val)); // Thin lines

    // Base gradient: Dark Green to Emerald
    vec3 bg = mix(vec3(0.0, 0.2, 0.1), vec3(0.0, 0.4, 0.2), uv.y);
    
    // Line color: Light Gold
    vec3 lines = vec3(0.8, 0.7, 0.4);
    
    vec3 color = mix(lines, bg, guilloche);
    
    // Metallic Shine (Sheen)
    float shine = pow(max(0.0, sin(uv.x * 3.0 + uv.y * 2.0 + uTime + uHover * 5.0)), 8.0);
    color += vec3(1.0, 0.9, 0.5) * shine * (0.5 + uHover);
    
    // Border gold
    float d = max(abs(uv.x - 0.5), abs(uv.y - 0.5));
    float border = smoothstep(0.45, 0.5, d);
    
    color = mix(color, vec3(1.0, 0.8, 0.2), border);
    
    // Floating particles (dust motes in light)
    if (uHover > 0.0) {
        float sparkle = step(0.98, fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453));
        color += sparkle * vec3(1.0);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

// 4. ADVANCED GLITCH (Digital Tearing & Data Corruption)
export const glitchFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uResolution;
  varying vec2 vUv;

  ${commonShaderPart}

  void main() {
    vec2 uv = vUv;
    
    // Quantize time for "stepped" glitch movement
    float t = floor(uTime * 20.0) / 20.0;
    
    // Create random block offsets
    float block = floor(uv.y * 20.0);
    float noiseVal = hash(vec2(block, t));
    
    // Displacement
    float displace = 0.0;
    if (noiseVal > 0.8) {
        displace = (hash(vec2(t)) - 0.5) * 0.2 * uHover;
    }
    uv.x += displace;
    
    // RGB Split (Chromatic Aberration)
    float split = 0.01 * (1.0 + uHover * 5.0) * noiseVal;
    
    vec3 color;
    color.r = step(0.5, sin(uv.x * 50.0 + uv.y * 10.0 + t)); // Pattern generation
    color.g = step(0.5, sin((uv.x + split) * 50.0 + uv.y * 10.0 + t));
    color.b = step(0.5, sin((uv.x - split) * 50.0 + uv.y * 10.0 + t));
    
    // Colorize
    vec3 baseColor = vec3(0.1, 0.1, 0.15); // Dark blue-grey background
    vec3 glitchColor = vec3(0.0, 1.0, 1.0); // Cyan
    
    // Mix pattern with colors
    vec3 finalColor = mix(baseColor, glitchColor, color.r);
    
    // Heavy glitch override
    if (noiseVal > 0.95 && uHover > 0.5) {
        finalColor = vec3(1.0) - finalColor; // Invert
    }
    
    // Scanlines
    finalColor *= 0.8 + 0.2 * sin(uv.y * 200.0);

    gl_FragColor = vec4(finalColor, 0.8);
  }
`;

// 5. ADVANCED SUNSET (Synthwave Sun & Grid)
export const sunsetFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    // Background Gradient (Sky)
    vec3 topColor = vec3(0.1, 0.0, 0.3); // Deep Purple
    vec3 bottomColor = vec3(0.6, 0.1, 0.4); // Magenta
    vec3 sky = mix(bottomColor, topColor, uv.y);
    
    // Sun Circle
    float dist = length(p - vec2(0.0, 0.2));
    float sunSize = 0.4;
    float sun = smoothstep(sunSize + 0.01, sunSize, dist);
    
    // Sun Banding (Scanlines cutting the sun)
    float band = sin(uv.y * 40.0 - uTime * 2.0);
    float bands = smoothstep(0.0, 0.2, band);
    
    // Crop bands to lower half of sun
    if (p.y > 0.2) bands = 1.0; 
    
    vec3 sunColor = mix(vec3(1.0, 0.0, 0.5), vec3(1.0, 0.8, 0.0), uv.y + 0.2);
    
    vec3 finalColor = mix(sky, sunColor, sun * bands);
    
    // Retro Grid floor (perspective)
    if (uv.y < 0.3) {
        // Pseudo 3D projection for grid on button
        float horizon = 0.3;
        float y = uv.y - horizon; // Negative
        float z = 0.1 / abs(y);
        
        float grid = step(0.95, fract(uv.x * z * 5.0 + uTime)) + step(0.95, fract(z));
        finalColor += vec3(0.0, 1.0, 1.0) * grid * 0.5 * abs(y) * 4.0;
    }
    
    // Hover glow
    if (uHover > 0.0) {
        finalColor += vec3(1.0, 0.5, 0.8) * uHover * 0.3;
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// BACKGROUND GRID FRAGMENT (Outrun Landscape)
export const gridFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vElevation;

  void main() {
    // Grid Lines
    vec2 gridUV = vUv * 40.0; // Tile density
    gridUV.y += uTime * 4.0;  // Speed
    
    float xLine = step(0.95, fract(gridUV.x));
    float yLine = step(0.95, fract(gridUV.y));
    float grid = max(xLine, yLine);
    
    // Colorize based on height (elevation)
    // Low (Road) = Cyan/Pink
    // High (Mountain) = Purple/Dark
    
    vec3 lowColor = vec3(0.0, 1.0, 1.0); // Cyan
    vec3 highColor = vec3(0.8, 0.0, 1.0); // Magenta
    vec3 mountainColor = vec3(0.1, 0.0, 0.2); // Dark base
    
    float heightFactor = smoothstep(0.0, 5.0, vElevation);
    
    vec3 gridColor = mix(lowColor, highColor, heightFactor);
    
    // Base color (between grid lines)
    vec3 baseColor = mountainColor * heightFactor;
    
    vec3 finalColor = mix(baseColor, gridColor, grid);
    
    // Distance Fog (Fade to black/bg)
    float dist = smoothstep(0.0, 0.8, vUv.y); // Top is far away in UV space of plane?
    // Actually vUv.y 0->1. 1 is top? depends on rotation.
    // Let's use transparency fade
    float alpha = (1.0 - smoothstep(0.5, 1.0, vUv.y)); 
    
    // Add glowing horizon
    float horizon = smoothstep(0.9, 1.0, vUv.y);
    finalColor += vec3(0.5, 0.2, 0.8) * horizon * 2.0;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
