
import React, { useRef, useEffect, useCallback } from 'react';
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
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const WebGLButton: React.FC<WebGLButtonProps> = ({
  effectType,
  primaryColor = [0.0, 1.0, 1.0], // Default Cyan
  secondaryColor = [1.0, 0.0, 1.0], // Default Magenta
  speed = 1.0,
  intensity = 1.0,
  label,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Physics State Refs (using refs for animation loop performance)
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const isHoveredRef = useRef(false);
  const hoverValueRef = useRef(0.0); // Lerped 0 to 1
  const clickTimeRef = useRef(-1000.0); // Timestamp of last click
  const tiltRef = useRef({ x: 0, y: 0 }); // Current tilt angle
  
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
      // Normalized 0 to 1 for Shader
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - ((e.clientY - rect.top) / rect.height); 
      mousePosRef.current = { x, y };

      // Tilt Logic (Range -1 to 1)
      const tiltX = (x - 0.5) * 2; 
      const tiltY = (y - 0.5) * 2; 
      
      // Target tilt angles (Max 15 degrees)
      const targetRotateX = -tiltY * 15;
      const targetRotateY = tiltX * 15;

      // Apply CSS transform directly for responsiveness
      containerRef.current.style.transform = `perspective(1000px) rotateX(${targetRotateX}deg) rotateY(${targetRotateY}deg) scale(1.02)`;
      
      // Store for physics smoothing if needed later
      tiltRef.current = { x: tiltX, y: tiltY };
    }
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => { 
    isHoveredRef.current = true;
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => { 
    isHoveredRef.current = false; 
    // Reset tilt
    if (containerRef.current) {
        containerRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
    // Reset mouse pos to center for shader
    mousePosRef.current = { x: 0.5, y: 0.5 };
    if (onMouseLeave) onMouseLeave(e);
  };
  
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

    // Enabling standard derivatives if available (for better bump mapping in plasma)
    gl.getExtension('OES_standard_derivatives');

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
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    // Debounce resize slightly or call on next frame
    requestAnimationFrame(resize);
    window.addEventListener('resize', resize);

    // 4. Render Loop
    const render = () => {
      if (!gl) return;
      
      const currentTime = (Date.now() - startTimeRef.current) * 0.001;

      // Logic: Smoothly interpolate hover value (Physics-like ease)
      const targetHover = isHoveredRef.current ? 1.0 : 0.0;
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
    // Outer wrapper handles the 3D perspective and full sizing
    <div 
      className="relative z-10 w-full h-full flex items-center justify-center p-4" 
      style={{ perspective: '1500px' }}
    >
        <div 
          ref={containerRef}
          className={`relative group flex items-center justify-center font-bold text-white transition-transform duration-100 ease-out will-change-transform overflow-hidden ${className}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Background Canvas - Pushed slightly back in Z space for depth */}
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, transform: 'translateZ(-10px)' }}
          />
          
          {/* Shine effect overlay (CSS) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" style={{ zIndex: 1 }} />

          {/* Content - Pushed forward in Z space */}
          <div ref={contentRef} className="relative z-20 w-full h-full" style={{ transform: 'translateZ(20px)' }}>
            <button 
                {...props}
                onClick={handleClick}
                className="w-full h-full bg-transparent border-none outline-none cursor-pointer uppercase tracking-widest text-shadow-xl transition-all duration-300 hover:text-white hover:tracking-[0.2em]"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
            >
                {label}
            </button>
          </div>
        </div>
    </div>
  );
};

export default WebGLButton;
