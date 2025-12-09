import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend, Object3DNode } from '@react-three/fiber';

export const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
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
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform sampler2D uTexClouds;
    uniform sampler2D uTexGalaxy;
    uniform sampler2D uTexNoise;

    varying vec2 vUv;

    #define PI 3.14159265359

    // Rotates a vector by an angle
    vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, -s, s, c);
      return m * v;
    }

    // Aspect ratio corrected UVs
    vec2 getAspectUV(vec2 uv) {
        float aspect = uResolution.x / uResolution.y;
        return vec2((uv.x - 0.5) * aspect + 0.5, uv.y);
    }

    void main() {
      vec2 uv = vUv;
      
      // ---------------------------------------------------------
      // 1. COORDINATE SETUP
      // ---------------------------------------------------------
      vec2 mouse = (uMouse + 1.0) * 0.5; // [-1,1] -> [0,1]
      
      vec2 aspectUV = getAspectUV(uv);
      vec2 aspectMouse = getAspectUV(mouse);
      
      vec2 toMouse = aspectUV - aspectMouse;
      float dist = length(toMouse);
      
      // ---------------------------------------------------------
      // 2. ORGANIC SHAPE GENERATION
      // ---------------------------------------------------------
      // Sample noise at two scales for detail
      float noiseLarge = texture2D(uTexNoise, uv * 0.5 + vec2(uTime * 0.02)).r;
      float noiseSmall = texture2D(uTexNoise, uv * 2.0 - vec2(uTime * 0.05)).r;
      
      // Combine noise for the edge distortion
      float organicNoise = mix(noiseLarge, noiseSmall, 0.5);
      
      // Distort the distance field to make the circle wobbly
      // We reduce the influence of noise as we get further away to keep background stable
      float distortedDist = dist - (organicNoise * 0.15 * smoothstep(1.0, 0.0, dist));

      float radius = 0.22;
      float edgeSoftness = 0.08;

      // Create the main mask (0 = Clouds, 1 = Portal)
      float mask = smoothstep(radius + edgeSoftness, radius, distortedDist);
      
      // ---------------------------------------------------------
      // 3. BACKGROUND (CLOUDS) WITH REFRACTION
      // ---------------------------------------------------------
      // Gravitational lensing: Push the background pixels AWAY from the portal center
      // Strength depends on how close we are to the portal edge
      float lensStrength = 0.15 * smoothstep(0.0, 0.4, dist) * smoothstep(0.8, 0.2, dist);
      vec2 lensUV = uv - (normalize(toMouse) * lensStrength * (1.0 - mask)); // Only refract outside
      
      vec4 texClouds = texture2D(uTexClouds, lensUV);
      
      // Darken clouds slightly around the rim to simulate depth/shadow
      float rimShadow = smoothstep(radius + 0.3, radius, distortedDist);
      texClouds.rgb *= (1.0 - rimShadow * 0.4);

      // ---------------------------------------------------------
      // 4. FOREGROUND (GALAXY) WITH SWIRL & ABERRATION
      // ---------------------------------------------------------
      // Vortex Effect: Rotate UVs inside the portal based on distance
      // Closer to center = faster rotation
      float rotationStrength = (1.0 - smoothstep(0.0, radius, dist)) * 2.0;
      vec2 centeredUV = uv - mouse;
      vec2 swirledUV = rotate(centeredUV, rotationStrength + uTime * 0.1) + mouse;
      
      // Add some flow to the galaxy using noise
      swirledUV += (vec2(noiseLarge, noiseSmall) - 0.5) * 0.1;

      // Chromatic Aberration (RGB Split)
      // Stronger near the edges of the portal
      float aberrIntensity = 0.015 * (1.0 + mask); 
      
      float r = texture2D(uTexGalaxy, swirledUV + vec2(aberrIntensity, 0.0)).r;
      float g = texture2D(uTexGalaxy, swirledUV).g;
      float b = texture2D(uTexGalaxy, swirledUV - vec2(aberrIntensity, 0.0)).b;
      
      vec3 texGalaxy = vec3(r, g, b);
      
      // Boost galaxy brightness/contrast
      texGalaxy = pow(texGalaxy, vec3(1.2)) * 1.4;

      // ---------------------------------------------------------
      // 5. COMPOSITION & GLOW
      // ---------------------------------------------------------
      vec3 finalColor = mix(texClouds.rgb, texGalaxy, mask);

      // Add a hot glowing rim
      // We make a thin band at the transition point
      float rim = smoothstep(radius + edgeSoftness, radius, distortedDist) * 
                  smoothstep(radius - 0.02, radius + 0.05, distortedDist);
                  
      vec3 glowColor = vec3(0.5, 0.9, 1.0); // Cyan/Electric Blue
      vec3 hotCore = vec3(1.0, 1.0, 1.0); // White hot center of the rim
      
      finalColor += (glowColor * rim * 2.0);
      finalColor += (hotCore * smoothstep(0.5, 1.0, rim) * 1.5);

      gl_FragColor = vec4(finalColor, 1.0);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ PortalMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    portalMaterial: Object3DNode<THREE.ShaderMaterial, typeof PortalMaterial>
  }
}