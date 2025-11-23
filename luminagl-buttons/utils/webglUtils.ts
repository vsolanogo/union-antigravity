/**
 * Creates and compiles a shader.
 */
export const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;
  
  console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
};

/**
 * Creates a program from two shaders.
 */
export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  
  console.error('Program linking error:', gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
};

/**
 * Sets up a full-screen quad buffer.
 */
export const createQuadBuffer = (gl: WebGLRenderingContext): WebGLBuffer | null => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Two triangles covering the clip space
  const positions = [
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
};