import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createShader, createProgram, createQuadBuffer } from '../utils/webglUtils';
import { 
  vertexShaderSource, 
  neonPulseFragment, 
  liquidPlasmaFragment, 
  cyberGridFragment,
  starFieldFragment,
  holographicFragment
} from '../utils/shaderLibrary';
import { EffectType } from '../types';

interface WebGLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  effectType: EffectType;
  primaryColor?: [number, number, number]; // RGB 0-1
  secondaryColor?: [number, number, number]; // RGB 0-1
  speed?: number; // Multiplier, default 1.0
  intensity?: number; // 0-1 range for how strong the effect is
  label: string;
}

const WebGLButton: React.FC<WebGLButtonProps> = ({
  effectType,
  primaryColor = [0.0, 1.0, 1.0], // Default Cyan
  secondaryColor = [1.0, 0.0, 1.0], // Default Magenta
  speed = 1.0,
  intensity = 1.0,
  label,
  className,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics State Refs (using refs for animation loop performance)
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const isHoveredRef = useRef(false);
  const hoverValueRef = useRef(0.0); // Lerped 0 to 1
  const clickTimeRef = useRef(-1000.0); // Timestamp of last click
  
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // Determine fragment shader source based on prop
  const getFragmentSource = useCallback(() => {
    switch (effectType) {
      case EffectType.LIQUID_PLASMA: return liquidPlasmaFragment;
      case EffectType.CYBER_GRID: return cyberGridFragment;
      case EffectType.STAR_FIELD: return starFieldFragment;
      case EffectType.HOLOGRAPHIC: return holographicFragment;
      case EffectType.NEON_PULSE:
      default:
        return neonPulseFragment;
    }
  }, [effectType]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - ((e.clientY - rect.top) / rect.height); 
      mousePosRef.current = { x, y };
    }
  }, []);

  const handleMouseEnter = () => { isHoveredRef.current = true; };
  const handleMouseLeave = () => { isHoveredRef.current = false; };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clickTimeRef.current = (Date.now() - startTimeRef.current) * 0.001;
    if (props.onClick) props.onClick(e);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Optional: Use 'low-power' or 'high-performance' depending on need
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;

    // 1. Setup Shaders
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, getFragmentSource());
    
    if (!vertShader || !fragShader) return;

    const program = createProgram(gl, vertShader, fragShader);
    if (!program) return;

    // 2. Setup Buffers
    const positionBuffer = createQuadBuffer(gl);
    const positionLoc = gl.getAttribLocation(program, 'position');
    
    // 3. Get Uniform Locations
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const color1Loc = gl.getUniformLocation(program, 'u_color1');
    const color2Loc = gl.getUniformLocation(program, 'u_color2');
    const speedLoc = gl.getUniformLocation(program, 'u_speed');
    const intensityLoc = gl.getUniformLocation(program, 'u_intensity');
    const hoverLoc = gl.getUniformLocation(program, 'u_hover');
    const clickTimeLoc = gl.getUniformLocation(program, 'u_click_time');

    // Resize handler
    const resize = () => {
        if (!containerRef.current || !canvas) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Optimize: don't render super high res on huge screens if not needed
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // 4. Render Loop
    const render = () => {
      if (!gl) return;
      
      const currentTime = (Date.now() - startTimeRef.current) * 0.001;

      // Logic: Smoothly interpolate hover value (Physics-like ease)
      const targetHover = isHoveredRef.current ? 1.0 : 0.0;
      // Lerp: current = current + (target - current) * factor
      hoverValueRef.current += (targetHover - hoverValueRef.current) * 0.1;

      gl.useProgram(program);

      // Attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      // Uniforms
      gl.uniform1f(timeLoc, currentTime);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mousePosRef.current.x, mousePosRef.current.y);
      gl.uniform3f(color1Loc, primaryColor[0], primaryColor[1], primaryColor[2]);
      gl.uniform3f(color2Loc, secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      gl.uniform1f(speedLoc, speed);
      gl.uniform1f(intensityLoc, intensity);
      gl.uniform1f(hoverLoc, hoverValueRef.current);
      if (clickTimeLoc) gl.uniform1f(clickTimeLoc, clickTimeRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [effectType, primaryColor, secondaryColor, speed, intensity, getFragmentSource]);

  return (
    <div 
      ref={containerRef}
      className={`relative group inline-flex items-center justify-center overflow-hidden rounded-lg font-bold text-white transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // We removed transform scale from CSS to let WebGL handle "feeling" of interaction, 
      // but keeping a slight scale transform is nice for tactile feedback.
      style={{ transform: isHoveredRef.current ? 'scale(1.02)' : 'scale(1)' }} 
    >
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      
      {/* Content */}
      <button 
        {...props}
        onClick={handleClick}
        className="relative z-10 px-8 py-4 w-full h-full bg-transparent border-none outline-none cursor-pointer uppercase tracking-widest text-sm text-shadow-sm transition-colors duration-300"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
      >
        <span className="relative z-10">{label}</span>
      </button>
    </div>
  );
};

export default WebGLButton;