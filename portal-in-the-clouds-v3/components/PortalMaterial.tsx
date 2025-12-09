import { shaderMaterial } from '@react-three/drei';
import { Vector2 } from 'three';

// Definition of the custom shader material
const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new Vector2(1, 1),
    uMouse: new Vector2(0.5, 0.5),
    uTexClouds: null,
    uTexGalaxy: null,
    uTexNoise: null,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform sampler2D uTexClouds;
    uniform sampler2D uTexGalaxy;
    uniform sampler2D uTexNoise;

    varying vec2 vUv;

    // Helper: Rotate UVs
    vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, -s, s, c);
      return m * v;
    }

    void main() {
      // --- 1. SETUP & COORDINATES ---
      vec2 uv = vUv;
      float aspectRatio = uResolution.x / uResolution.y;
      
      // Center coordinates (0,0 is center of screen)
      vec2 centeredUv = uv - 0.5;
      centeredUv.x *= aspectRatio;
      
      vec2 mouseCentered = uMouse - 0.5;
      mouseCentered.x *= aspectRatio;

      // Distance from the mouse (portal center)
      // We add some noise to the position to warp the shape of the portal itself
      float noiseTime = uTime * 0.2;
      vec4 noiseVal = texture2D(uTexNoise, uv * 1.5 + vec2(noiseTime * 0.1, noiseTime));
      
      // Warped coordinates for the portal shape
      vec2 warpedUv = centeredUv + (noiseVal.rg - 0.5) * 0.15;
      float dist = distance(warpedUv, mouseCentered);

      // --- 2. PORTAL MASK & SHAPE ---
      // Define radius and softness
      float radius = 0.22;
      
      // Dynamic fluctuating radius (pulsing effect)
      float pulse = sin(uTime * 1.5) * 0.01;
      radius += pulse;

      // The 'Hole' mask
      // smoothstep(outer, inner, dist) -> 0 at outer edge, 1 at center
      float edgeWidth = 0.15; // wide transition for "gaseous" look
      float portalMask = smoothstep(radius + edgeWidth, radius - 0.02, dist);
      
      // Rim mask for the glowing edge
      float rimMask = smoothstep(radius + edgeWidth + 0.05, radius, dist) - portalMask;
      rimMask = clamp(rimMask, 0.0, 1.0);

      // --- 3. OPTICAL DISTORTION (Shockwave) ---
      // Distort the background clouds around the portal
      vec2 dir = normalize(centeredUv - mouseCentered);
      float distortionStrength = rimMask * 0.15; // Strongest at rim
      vec2 distortedCloudUv = uv - dir * distortionStrength;
      
      // --- 4. PARALLAX GALAXY ---
      // Simulate depth: The galaxy moves less than the portal frame (window effect)
      // We assume the 'camera' moves with the mouse, so background moves opposite or slower.
      vec2 galaxyParallax = (uMouse - 0.5) * 0.4; 
      vec2 galaxyUv = uv + galaxyParallax;
      
      // Swirl the galaxy slightly over time
      vec2 centeredGalaxy = galaxyUv - 0.5;
      float angle = length(centeredGalaxy) * 2.0 - uTime * 0.1;
      galaxyUv = 0.5 + rotate(centeredGalaxy, angle * 0.1);

      // --- 5. CHROMATIC ABERRATION ---
      // Split RGB channels near the portal edge for a sci-fi lens effect
      float aber = distortionStrength * 0.08; 
      
      vec4 colCloudR = texture2D(uTexClouds, distortedCloudUv + vec2(aber, 0.0));
      vec4 colCloudG = texture2D(uTexClouds, distortedCloudUv);
      vec4 colCloudB = texture2D(uTexClouds, distortedCloudUv - vec2(aber, 0.0));
      vec3 finalClouds = vec3(colCloudR.r, colCloudG.g, colCloudB.b);

      // Darken clouds slightly around the portal to emphasize the light
      finalClouds *= smoothstep(0.0, 0.8, dist);

      // --- 6. GALAXY COMPOSITION ---
      vec3 finalGalaxy = texture2D(uTexGalaxy, galaxyUv * 0.8).rgb; // Scale uv to zoom in galaxy
      // Brighten galaxy
      finalGalaxy *= 1.4;

      // --- 7. FINAL MIX ---
      vec3 color = mix(finalClouds, finalGalaxy, portalMask);
      
      // Add the glowing rim (additive blending)
      // Use noise texture to make the glow "electric"
      float glowNoise = texture2D(uTexNoise, uv * 4.0 - vec2(0.0, uTime)).r;
      vec3 glowColor = vec3(0.4, 0.7, 1.0) + vec3(0.5, 0.2, 0.8) * glowNoise; // Cyan/Purple mix
      
      // Intensity of glow
      float glowIntensity = rimMask * 2.0 * (0.8 + 0.4 * sin(uTime * 3.0));
      color += glowColor * glowIntensity;

      // Extra white-hot core at the very edge of the transition
      float coreRim = smoothstep(0.05, 0.0, abs(dist - radius));
      color += vec3(1.0) * coreRim * 0.3 * portalMask;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

export { PortalMaterial };
