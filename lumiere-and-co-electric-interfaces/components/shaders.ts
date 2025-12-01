
// Shared utility functions for all shaders
const commonShaderUtils = `
  // Pseudo-random function
  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // 2D Noise
  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  // Fractal Brownian Motion
  float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
      }
      return v;
  }

  // Signed Distance Function for a rounded box
  float sdRoundedBox(vec2 p, vec2 b, float r) {
      vec2 d = abs(p) - b + r;
      return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
  }

  // Signed Distance Function for a circle
  float sdCircle(vec2 p, float r) {
      return length(p) - r;
  }
`;

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// --- EDISON: Tungsten Filament inside Smoked Glass ---
export const edisonFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uAspect;
  varying vec2 vUv;

  ${commonShaderUtils}

  void main() {
    // Standard UVs for background textures
    vec2 uv = vUv * 2.0 - 1.0; 
    
    // Corrected UVs for physical shapes (Bulb)
    vec2 p = uv;
    p.x *= uAspect;

    vec2 mouse = uMouse * 2.0 - 1.0;
    mouse.x *= uAspect;

    // Background Darkness / Vignette independent of aspect
    float vignette = 1.0 - length(uv * 0.5);
    vec3 bg = vec3(0.02, 0.01, 0.0) * vignette;

    // Glass shape (Capsule/Tube feel) - Fixed physical size
    float d = sdRoundedBox(p, vec2(1.2, 0.5), 0.2);
    
    // Filament shape (Sine wave)
    float filamentY = p.y + sin(p.x * 12.0) * 0.08;
    // Limit filament to inside the bulb
    float filamentMask = smoothstep(0.0, 0.1, 1.1 - abs(p.x)); 
    float filament = (1.0 - smoothstep(0.0, 0.04, abs(filamentY))) * filamentMask;
    
    // Heat glow
    float glowSize = 0.05 + uHover * 0.1; 
    float glow = exp(-abs(filamentY) * (10.0 - uHover * 5.0)) * filamentMask;
    
    // Filament Color (Hot Tungsten)
    vec3 colOff = vec3(0.1, 0.05, 0.0);
    vec3 colOn = vec3(1.0, 0.6, 0.2) * 2.5;
    vec3 filamentColor = mix(colOff, colOn, uHover * 0.8 + 0.2);
    
    // Glass Surface
    vec3 glassColor = vec3(0.05, 0.02, 0.01);
    
    // Specular Reflection (Glassiness)
    vec3 normal = normalize(vec3(p.x, p.y, 1.0 - length(p)*0.4));
    vec3 lightDir = normalize(vec3(mouse.x, mouse.y, 1.0));
    float spec = pow(max(dot(normal, lightDir), 0.0), 40.0);
    
    // Combine content
    vec3 objColor = glassColor;
    objColor += filamentColor * glow;         
    objColor += filamentColor * filament * 2.0; 
    objColor += vec3(1.0, 0.9, 0.8) * spec * 0.6; 

    // Bulb Border
    float border = smoothstep(0.0, 0.05, -d);
    
    // Glass bezel edge
    float bezel = smoothstep(0.03, 0.0, abs(d + 0.02));
    objColor += vec3(0.4, 0.3, 0.2) * bezel;

    // Mix Object with Background
    // Alpha for the bulb object
    float alpha = smoothstep(0.01, 0.0, d);
    
    // Add some reflection of the environment on the background plate
    float plateReflect = fbm(uv * 5.0 + uTime * 0.05) * 0.05;
    bg += vec3(0.1, 0.05, 0.0) * plateReflect;

    vec3 finalColor = mix(bg, objColor, alpha);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- TESLA: Vacuum Tube with Plasma ---
export const teslaFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uAspect;
  varying vec2 vUv;

  ${commonShaderUtils}

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    vec2 p = uv;
    p.x *= uAspect;
    
    // Background fog
    float fog = fbm(uv * 2.0 + uTime * 0.2);
    vec3 bg = vec3(0.05, 0.08, 0.12) * fog * 0.5;

    // Electric Arc Generation inside tube
    float t = uTime * 3.0;
    vec3 arcColorTotal = vec3(0.0);
    
    for(int i = 0; i < 3; i++) {
        float scale = 1.0 + float(i) * 0.5;
        vec2 boltP = p;
        
        // Constrain bolts to tube area roughly
        if (abs(boltP.x) < 1.3 && abs(boltP.y) < 0.6) {
            // Distort space
            boltP.x += fbm(vec2(boltP.y * 4.0, t * scale)) * 0.15;
            
            // Intensity
            float width = 0.015 + uHover * 0.03;
            float bolt = width / abs(boltP.y * boltP.x * 1.5 + sin(boltP.x * 8.0 + t) * 0.15); 
            
            // Color tint
            vec3 boltColor = vec3(0.3, 0.6, 1.0);
            if(i == 1) boltColor = vec3(0.7, 0.3, 1.0);
            
            arcColorTotal += boltColor * bolt * (0.3 + uHover);
        }
    }
    
    // Glass container shape
    float d = sdRoundedBox(p, vec2(1.3, 0.6), 0.15);
    float mask = smoothstep(0.0, 0.01, -d);
    
    // Inner Glow
    float innerGlow = smoothstep(0.0, 0.8, 0.6 - length(p * vec2(0.5, 1.0)));
    vec3 tubeContent = vec3(0.0, 0.05, 0.15) * innerGlow + arcColorTotal;

    // Metal Frame
    float border = smoothstep(0.0, 0.05, abs(d));
    float metallic = fbm(p * 15.0); 
    vec3 frameColor = vec3(0.4, 0.45, 0.5) * metallic;
    
    // Highlight on frame
    vec2 mouse = uMouse * 2.0 - 1.0;
    mouse.x *= uAspect;
    vec3 normal = normalize(vec3(p, 1.0));
    vec3 light = normalize(vec3(mouse, 1.0));
    float spec = pow(max(dot(normal, light), 0.0), 12.0);
    frameColor += vec3(0.8, 0.9, 1.0) * spec;

    // Combine Tube
    vec3 tubeColor = mix(frameColor, tubeContent, mask);
    // Soft edge for tube
    float alpha = smoothstep(0.02, 0.0, d);
    
    vec3 finalColor = mix(bg, tubeColor, alpha);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- RADIUM: Phosphorescent Gauge ---
export const radiumFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uAspect;
  varying vec2 vUv;

  ${commonShaderUtils}

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    vec2 p = uv;
    p.x *= uAspect;
    
    float len = length(p);
    
    // Background metal texture for the panel
    float metalNoise = fbm(uv * 10.0);
    vec3 bg = vec3(0.1, 0.12, 0.1) * (0.8 + 0.2 * metalNoise);

    // Gauge Circle
    float radius = 0.85;
    float circleDist = sdCircle(p, radius);
    
    // Radar/Gauge sweep
    float angle = atan(p.y, p.x);
    float sweep = mod(angle + uTime * 2.5, 6.28318);
    float beam = smoothstep(5.0, 6.28, sweep) * 0.5;
    
    // Grid/Reticle
    float rings = sin(len * 25.0);
    float grid = smoothstep(0.95, 1.0, rings) * 0.3;
    
    // Decay noise
    float staticNoise = hash(uv * uTime) * 0.15;
    
    // Phosphor Colors
    vec3 glowColor = vec3(0.2, 0.9, 0.4);
    vec3 darkColor = vec3(0.01, 0.15, 0.05);
    
    float intensity = 0.6 + uHover * 1.2;
    
    // Gauge Content
    vec3 content = darkColor;
    content += glowColor * beam * intensity;
    content += glowColor * grid * (0.5 + uHover * 0.5);
    content += staticNoise;
    
    // Shadow vignetting inside gauge
    content *= 1.0 - smoothstep(0.4, 0.85, len);
    
    // Glass Lens Glare
    vec2 mouse = uMouse * 2.0 - 1.0;
    mouse.x *= uAspect;
    float distToMouse = distance(p, mouse);
    float glare = 1.0 - smoothstep(0.0, 0.8, distToMouse);
    content += vec3(0.9, 1.0, 0.95) * glare * 0.25; 
    
    // Bevel/Rim
    float rimWidth = 0.08;
    float rimMask = smoothstep(radius, radius + rimWidth, len) - smoothstep(radius + rimWidth, radius + rimWidth + 0.02, len);
    // Rim lighting
    vec3 normal = normalize(vec3(p, 0.5));
    vec3 light = normalize(vec3(mouse, 1.0));
    float rimShine = pow(max(dot(normal, light), 0.0), 6.0);
    vec3 rimCol = vec3(0.6, 0.5, 0.3) * (0.4 + rimShine * 1.5);

    // Composite
    // Inside gauge
    float insideMask = 1.0 - smoothstep(radius - 0.01, radius, len);
    // Rim
    float borderMask = 1.0 - smoothstep(radius + rimWidth, radius + rimWidth + 0.01, len);
    
    vec3 finalColor = mix(bg, rimCol, borderMask); // Draw rim over bg
    finalColor = mix(finalColor, content, insideMask); // Draw content inside rim

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- BRASS: Polished Steampunk Plate ---
export const brassFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uAspect;
  varying vec2 vUv;

  ${commonShaderUtils}

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    vec2 p = uv;
    p.x *= uAspect;
    
    // Material Properties
    vec3 baseGold = vec3(0.65, 0.45, 0.15); 
    vec3 highlightGold = vec3(1.0, 0.9, 0.5); 
    
    // The plate fills almost the entire quadrant, leaving a small gap
    // Use dynamic box size based on aspect
    vec2 boxSize = vec2(uAspect - 0.1, 0.9);
    float d = sdRoundedBox(p, boxSize, 0.1);
    
    // Brushed Metal Texture
    // Texture should follow the object surface, so use p
    float brush = noise(vec2(p.x * 40.0, p.y * 2.0)); 
    float patina = fbm(p * 6.0); 
    
    // Pseudo-3D Bevel Logic
    float height = smoothstep(0.0, 0.15, -d); 
    
    // Bump mapping for edges + internal decorative grooves
    float groove = smoothstep(0.45, 0.5, abs(sin(length(p)*5.0)));
    
    // Calculate Normal
    vec2 eps = vec2(0.01, 0.0);
    float hC = smoothstep(0.0, 0.15, -sdRoundedBox(p, boxSize, 0.1)) - groove * 0.02;
    float hR = smoothstep(0.0, 0.15, -sdRoundedBox(p + eps.xy, boxSize, 0.1)) - groove * 0.02;
    float hU = smoothstep(0.0, 0.15, -sdRoundedBox(p + eps.yx, boxSize, 0.1)) - groove * 0.02;
    
    vec3 normal = normalize(vec3(hC - hR, hC - hU, 0.05)); 
    
    // Interactive Light
    vec2 mouse = uMouse * 2.0 - 1.0;
    mouse.x *= uAspect;
    vec3 lightDir = normalize(vec3(mouse.x, mouse.y, 1.0));
    
    // Lighting
    float diffuse = max(dot(normal, lightDir), 0.0);
    float specular = pow(max(dot(reflect(-lightDir, normal), vec3(0,0,1)), 0.0), 24.0);
    
    // Hover Interaction: The whole plate gets hotter/brighter or depresses?
    // Let's make it shift color slightly like it's heating up or being pressed
    float press = uHover * 0.1;
    
    // Combine
    vec3 albedo = baseGold * (0.8 + 0.2 * brush) * (1.0 - 0.3 * patina);
    
    // Add decorative etched text/pattern
    float pattern = step(0.9, fbm(p * 20.0));
    albedo = mix(albedo, baseGold * 0.5, pattern * 0.1);

    vec3 finalColor = albedo * (0.4 + 0.6 * diffuse);
    finalColor += highlightGold * specular * (0.8 + uHover * 0.5); 
    
    // Ambient Occlusion at edges
    float edgeAO = smoothstep(0.0, 0.15, -d);
    finalColor *= 0.4 + 0.6 * edgeAO;

    // Background transparency (gap between plates)
    float alpha = smoothstep(0.01, 0.0, d);
    
    // Very dark background for the gap
    vec3 gapColor = vec3(0.05, 0.03, 0.0);
    finalColor = mix(gapColor, finalColor, alpha);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
