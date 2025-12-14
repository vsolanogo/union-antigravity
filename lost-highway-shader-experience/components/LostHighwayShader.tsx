import React, { useRef, useLayoutEffect } from 'react';
import { ShaderProps } from '../types';

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_speed;
  uniform float u_boost;
  uniform vec2 u_mouse;

  #define PI 3.14159265359

  // --- Noise & Math Utils ---
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // 3D Noise for volumetric feel
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i.xy + vec2(0,0) + i.z*0.0), hash(i.xy + vec2(1,0) + i.z*0.0), f.x),
                   mix(hash(i.xy + vec2(0,1) + i.z*0.0), hash(i.xy + vec2(1,1) + i.z*0.0), f.x), f.y),
               mix(mix(hash(i.xy + vec2(0,0) + i.z*1.0), hash(i.xy + vec2(1,0) + i.z*1.0), f.x),
                   mix(hash(i.xy + vec2(0,1) + i.z*1.0), hash(i.xy + vec2(1,1) + i.z*1.0), f.x), f.y), f.z);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise2D(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  // --- Scene Geometry & Effects ---

  float getRoadCurve(float z) {
    // A long, winding highway
    return sin(z * 0.007) * 8.0 + sin(z * 0.02) * 2.0;
  }

  // Rain droplets on camera lens
  float rain(vec2 uv) {
    vec2 a = vec2(50.0, 1.0);
    vec2 st = uv * a;
    vec2 id = floor(st);
    st.y += u_time * (1.0 + u_boost * 3.0); // Rain falls down relative to lens
    float n = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
    st.y += n; 
    uv.y += n;
    id = floor(st);
    st = fract(st) - 0.5;
    
    // Droplet shape
    float d = length(st);
    return smoothstep(0.15, 0.05, d) * smoothstep(0.05, 0.1, d) * 2.0; // Ring-ish
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    
    // --- Camera Control ---
    // Mouse X steers the car (moves Camera X), Mouse Y looks up/down
    float steer = (u_mouse.x - 0.5) * 6.0;
    float lookY = (u_mouse.y - 0.5) * 0.5;
    
    // Shake and Boost warp
    float shakeIntensity = 0.005 + u_boost * 0.02;
    vec2 shake = vec2(hash(vec2(u_time, 0.0)), hash(vec2(0.0, u_time))) * shakeIntensity;
    
    vec3 ro = vec3(steer, 1.4 - u_boost * 0.4, 0.0); // Camera origin
    vec3 rd = normalize(vec3(uv + shake, -0.9 + length(uv) * 0.3)); // Ray direction
    
    // Look up/down rotation
    float cy = cos(lookY), sy = sin(lookY);
    rd.yz = mat2(cy, -sy, sy, cy) * rd.yz;

    // --- Lightning System ---
    float lightningSeed = floor(u_time * 5.0); // Flashes last ~0.2s
    float lightningChance = hash(vec2(lightningSeed, 123.0));
    float lightning = 0.0;
    if (lightningChance > 0.96) {
      lightning = hash(vec2(u_time, 0.0)) * 0.8; // Flicker intensity
    }
    
    // --- Ray Casting ---
    // Plane: y = 0.
    float t = -(ro.y) / rd.y;
    
    vec3 col = vec3(0.01); // Deep dark background
    
    // Sky Gradient
    float horizon = smoothstep(0.05, -0.05, rd.y);
    vec3 skyCol = vec3(0.02, 0.02, 0.05) + lightning * vec3(0.2, 0.25, 0.4);
    col = mix(skyCol, col, 1.0 - horizon);

    if (t > 0.0) {
      vec3 p = ro + t * rd;
      
      // Global Movement
      float speed = u_speed * (1.0 + u_boost * 2.5);
      float zPos = p.z + u_time * speed;
      
      // Apply Curve
      float curve = getRoadCurve(zPos);
      float dx = p.x - curve; // Relative X position on the road
      
      // --- Materials ---
      float roadWidth = 4.0;
      float shoulderWidth = 3.0;
      
      // Base Noise for road texture (High freq for asphalt grain, Low freq for puddles)
      float asphaltNoise = fbm(p.xz * 2.0 + vec2(0.0, zPos * 0.05));
      float puddleNoise = noise2D(p.xz * 0.2 + vec2(0.0, zPos * 0.01));
      float wetness = smoothstep(0.4, 0.7, puddleNoise); // 0 = dry, 1 = wet
      
      vec3 groundCol = vec3(0.05);
      float reflectivity = 0.0;
      
      if (abs(dx) < roadWidth) {
        // ROAD
        groundCol = vec3(0.08) * (0.8 + 0.4 * asphaltNoise);
        
        // Darken wet areas
        groundCol *= (1.0 - wetness * 0.5);
        
        // Lines
        float lineDist = abs(dx);
        float centerLine = step(lineDist, 0.15) * step(0.5, sin(zPos * 0.5)); // Dashed
        float edgeLine = step(abs(lineDist - roadWidth + 0.2), 0.15); // Solid white
        
        vec3 yellow = vec3(1.0, 0.6, 0.0) * 1.5;
        vec3 white = vec3(0.8);
        
        // Line rendering
        groundCol = mix(groundCol, yellow, centerLine);
        groundCol = mix(groundCol, white, edgeLine);
        
        // Wetness affects reflectivity
        reflectivity = mix(0.1, 0.9, wetness);
        
      } else if (abs(dx) < roadWidth + shoulderWidth) {
        // SHOULDER (Dirt/Gravel)
        float dirt = fbm(p.xz * 1.5);
        groundCol = vec3(0.04, 0.03, 0.02) * dirt;
        reflectivity = 0.05 * wetness;
      } else {
        // GRASS/TERRAIN
        float grass = fbm(p.xz * 0.5);
        groundCol = vec3(0.01, 0.02, 0.01) * grass;
      }
      
      // --- Lighting ---
      
      // 1. Lightning Ambient
      groundCol += lightning * vec3(0.1, 0.12, 0.2);
      
      // 2. Headlights (Dual Beams)
      // Left headlight
      vec3 lightPosL = vec3(curve - 1.5, 0.8, p.z + 1.0); 
      // Right headlight
      vec3 lightPosR = vec3(curve + 1.5, 0.8, p.z + 1.0);
      
      // Project light onto current point p
      // We simulate this by checking distance from the "beam center" at this Z depth
      float beamZ = t; // Distance from camera
      
      // Attenuation
      float atten = 1.0 / (1.0 + beamZ * beamZ * 0.001);
      
      // Beam shape (two cones)
      float beamL = smoothstep(3.0 + beamZ*0.15, 0.0, distance(dx, -1.2));
      float beamR = smoothstep(3.0 + beamZ*0.15, 0.0, distance(dx, 1.2));
      
      float headlightIntensity = (beamL + beamR) * atten * 4.0;
      
      // Flicker
      headlightIntensity *= 0.98 + 0.02 * sin(u_time * 40.0);
      
      // Apply Diffuse
      col = groundCol * (0.2 + headlightIntensity); // 0.2 is ambient
      
      // --- Specular Reflections (The "Wet" Look) ---
      // Vector from point to camera
      vec3 V = normalize(ro - p);
      // Normal of the ground (perturbed by noise for asphalt roughness)
      vec3 N = normalize(vec3(0.0, 1.0 + asphaltNoise * 0.2, 0.0)); 
      if (wetness > 0.5) N = vec3(0.0, 1.0, 0.0); // Water is flat
      
      // Light Direction (Approximated as coming from the car)
      vec3 L = normalize(vec3(curve - p.x, 0.5, -1.0));
      
      // Blinn-Phong Specular
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(N, H), 0.0), 30.0 + (1.0-wetness)*10.0);
      
      // Add specular highlight to color
      col += vec3(1.0) * spec * headlightIntensity * reflectivity * 2.0;
      
      // --- Reflectors ---
      // Red reflectors on the right side
      float reflectorZ = mod(zPos, 40.0);
      if (abs(dx - (roadWidth + 0.5)) < 0.2 && reflectorZ < 0.5) {
         col += vec3(3.0, 0.0, 0.0) * atten * 10.0; // Glow bright red
      }

      // --- Fog ---
      // Distance fog + Height fog
      float fogDist = 1.0 - exp(-t * 0.015);
      // Lightning brightens the fog
      vec3 fogColor = mix(vec3(0.0), vec3(0.1, 0.12, 0.2), lightning);
      col = mix(col, fogColor, fogDist);
    }
    
    // --- Post Processing ---
    
    // 1. Rain on Lens (Screen Space)
    // Create droplets that refract the image
    vec2 dropUV = uv;
    dropUV.x += u_time * 0.1; // Horizontal wind
    float drops = rain(dropUV * 2.0);
    
    // Distort UV where drops are
    vec2 rainDistortion = vec2(drops) * 0.05;
    // We can't re-sample texture in single pass procedural, 
    // but we can lighten the pixel to simulate a lens flare on the drop
    col += vec3(0.8, 0.9, 1.0) * drops * (0.5 + lightning);

    // 2. Chromatic Aberration (Stronger at edges & boost)
    float aber = length(uv) * (0.005 + u_boost * 0.03);
    // Fake aberration by Tinting
    col.r *= 1.0 + aber * 2.0;
    col.b *= 1.0 - aber;
    
    // 3. Vignette
    col *= 1.0 - dot(uv, uv) * 0.8;
    
    // 4. Color Grading (Noir/Matrix)
    col = pow(col, vec3(1.2)); // Contrast
    col *= vec3(1.0, 1.02, 0.98); // Cinema tint
    
    // 5. Noise/Grain
    col += (hash(uv * u_time) - 0.5) * 0.12;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const LostHighwayShader: React.FC<ShaderProps> = ({ 
  speed = 30.0, 
  boost = 0.0,
  mouseX = 0.5,
  mouseY = 0.5,
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const boostLocation = gl.getUniformLocation(program, 'u_boost');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

    let animationFrameId: number;
    const startTime = Date.now();

    const render = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      const currentTime = (Date.now() - startTime) * 0.001;

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, currentTime);
      gl.uniform1f(speedLocation, speed);
      gl.uniform1f(boostLocation, boost);
      gl.uniform2f(mouseLocation, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [speed, boost, mouseX, mouseY]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`block w-full h-full object-cover ${className}`}
    />
  );
};

export default LostHighwayShader;