import React, { useEffect, useRef } from 'react';

// TENSOR FLOW SHADER
// Visualizes a high-dimensional manifold with glowing data streams.
// Fixed z-index and rendering logic to ensure visibility.

const vertexShaderSource = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

out vec4 outColor;

// --- UTILS ---
mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * (1.0 / 4.0);
}

// --- GEOMETRY ---
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
    vec3 q = p;
    
    // Global Twist based on depth
    p.xy *= rot(p.z * 0.05 + u_time * 0.2);
    
    // Repetition (Infinite Field)
    float spacing = 4.0;
    vec3 id = floor((p + spacing * 0.5) / spacing);
    p = mod(p + spacing * 0.5, spacing) - spacing * 0.5;
    
    // Individual element rotation
    float rnd = fract(sin(dot(id, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
    p.xz *= rot(u_time * (0.5 + rnd));
    p.xy *= rot(u_time * (0.3 + rnd));
    
    // Shapes
    float box = sdBox(p, vec3(0.6));
    // Crossbars
    float barW = 0.2;
    float barL = 1.2;
    float bars = min(sdBox(p, vec3(barL, barW, barW)), 
                     min(sdBox(p, vec3(barW, barL, barW)), 
                         sdBox(p, vec3(barW, barW, barL))));
    
    // Smooth blend
    return smin(box, bars, 0.2);
}

void main() {
    // 1. Setup UVs
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec2 m = (u_mouse.xy / u_resolution.xy) * 2.0 - 1.0;

    // 2. Camera Setup
    vec3 ro = vec3(0.0, 0.0, 5.0 + u_time * 4.0); // Moving forward
    vec3 ta = ro + vec3(0.0, 0.0, 1.0);
    
    // Mouse look
    ro.xy += m * 2.0;

    vec3 f = normalize(ta - ro);
    vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
    vec3 u = cross(f, r);
    vec3 rd = normalize(f + uv.x * r + uv.y * u);

    // 3. Raymarch
    float t = 0.0;
    vec3 col = vec3(0.0);
    float d = 0.0;
    
    // Accumulate glow
    vec3 glow = vec3(0.0);
    
    for(int i = 0; i < 80; i++) {
        vec3 p = ro + rd * t;
        d = map(p);
        
        // Dynamic Glow Color based on spatial position
        vec3 tint = 0.5 + 0.5 * cos(u_time * 0.5 + p.z * 0.1 + vec3(0.0, 2.0, 4.0));
        
        // Distance based glow accumulation
        float glowIntensity = 0.02 / (0.02 + abs(d));
        glow += glowIntensity * tint * 0.6;
        
        t += d * 0.6; // Step size
        if(d < 0.001 || t > 60.0) break;
    }
    
    // 4. Composition
    col = glow;
    
    // Distance Fog (fade to black)
    col *= 1.0 / (1.0 + t * t * 0.002);
    
    // Tone Mapping
    col = 1.0 - exp(-col * 1.5);
    
    // Vignette
    col *= 1.0 - length(uv) * 0.5;

    outColor = vec4(col, 1.0);
}`;

const TensorBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { 
        alpha: false,
        powerPreference: "high-performance" 
    });
    
    if (!gl) {
      console.error("WebGL2 not supported. Try updating browser.");
      return;
    }

    // --- Shader Compilation ---
    const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Compile Error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program Link Error:", gl.getProgramInfoLog(program));
        return;
    }

    // --- Buffers ---
    const positionLoc = gl.getAttribLocation(program, "a_position");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // --- Event Listeners ---
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = canvas.height - e.clientY; // Flip Y
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- Render Loop ---
    const render = () => {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, (Date.now() - startTimeRef.current) * 0.001);
      gl.uniform2f(mouseLoc, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    // --- Cleanup ---
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      
      // WebGL Cleanup
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
      gl.deleteVertexArray(vao);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-0 block"
      style={{ pointerEvents: 'none' }} // Ensure clicks pass through to content
    />
  );
};

export default TensorBackground;