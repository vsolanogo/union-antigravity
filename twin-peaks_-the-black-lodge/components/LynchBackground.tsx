import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;

  // Constants
  const int MAX_STEPS = 128;
  const float MAX_DIST = 40.0;
  const float SURF_DIST = 0.001;
  const float PI = 3.14159265359;

  // --- Noise Functions ---
  float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
  }

  float noise(vec2 p) {
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
      for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
      }
      return v;
  }

  // --- SDF Geometry Primitives ---
  
  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  }
  
  float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
  }

  float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
  }
  
  // Cylinder with different radii at top and bottom
  float sdCappedCone( vec3 p, float h, float r1, float r2 ) {
    vec2 q = vec2( length(p.xz), p.y );
    vec2 k1 = vec2(r2,h);
    vec2 k2 = vec2(r2-r1,2.0*h);
    vec2 ca = vec2(q.x-min(q.x,(q.y<0.0)?r1:r2), abs(q.y)-h);
    vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot(k2,k2), 0.0, 1.0 );
    float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
    return s*sqrt( min(dot(ca,ca),dot(cb,cb)) );
  }

  float smin(float a, float b, float k) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
  }

  // --- Scene Objects ---

  // 1. Floor Plane (y=0)
  float sdFloor(vec3 p) {
      return p.y;
  }

  // 2. Curtains
  // Modeled as vertical sine waves on walls
  float sdCurtains(vec3 p) {
      // Wall position base
      float zWall = 8.0;
      float xWall = 10.0; // Room width/2
      
      // Curtain waviness (Folds)
      // Main folds
      float fold = sin(p.x * 2.5) * 0.4;
      // Secondary detail folds
      float micro = sin(p.x * 8.0) * 0.08;
      // Organic variance
      float organic = sin(p.y * 1.5 + u_time * 0.2) * 0.1;

      // Back Wall
      float dBack = -(p.z - zWall + fold + micro + organic);

      // Side Walls (Rotate pattern 90 deg roughly)
      float sideFold = sin(p.z * 2.5) * 0.4;
      float sideMicro = sin(p.z * 8.0) * 0.08;
      
      float dLeft = p.x + xWall + sideFold + sideMicro;
      float dRight = -(p.x - xWall) + sideFold + sideMicro;
      
      return min(dBack, min(dLeft, dRight));
  }

  // 3. Statue (Classical Roman Goddess Style)
  float sdStatue(vec3 p) {
      vec3 off = vec3(-3.0, 0.0, 3.5);
      vec3 pos = p - off;
      
      // Rotate for better angle
      float ang = 0.6;
      float c = cos(ang); float s = sin(ang);
      pos.xz = mat2(c,-s,s,c) * pos.xz;
      
      // Pedestal
      float dPedestal = sdBox(pos - vec3(0.0, 0.4, 0.0), vec3(0.35, 0.4, 0.35));
      
      // -- Body Construction --
      vec3 q = pos - vec3(0.0, 0.8, 0.0);
      
      // Contrapposto shift: Hips left, Shoulders right
      float hipShift = -0.05;
      float shoulderShift = 0.04;
      
      // 1. Skirt / Lower Body (Draped Cloth)
      // Cylinderish base with noise for folds
      vec3 skirtPos = q - vec3(0.0, 0.45, 0.0);
      // Slight bend in legs
      skirtPos.x -= 0.02 * sin(skirtPos.y * 3.0);
      
      float dSkirtMain = sdCappedCone(skirtPos, 0.45, 0.28, 0.18);
      
      // "Wet Drapery" Folds
      float angle = atan(skirtPos.x, skirtPos.z);
      // Complex folding pattern
      float folds = 0.0;
      // Large folds
      folds += sin(angle * 7.0 + skirtPos.y * 2.5) * 0.015;
      // Smaller creases
      folds += sin(angle * 15.0 - skirtPos.y * 4.0) * 0.008;
      // Micro detail
      folds += sin(angle * 30.0) * 0.003;
      
      // Folds gather at waist (top of skirt, y approx 0.45 relative to skirtPos)
      float waistFade = smoothstep(0.4, 0.0, abs(skirtPos.y - 0.45));
      // Folds flare at bottom
      float bottomFlare = smoothstep(-0.4, 0.4, -skirtPos.y);
      
      float dSkirt = dSkirtMain + folds * (0.6 + 0.4 * bottomFlare);
      
      // 2. Torso
      // Hips area
      vec3 hipPos = q - vec3(hipShift, 0.9, 0.0);
      float dHips = sdCapsule(hipPos, vec3(0.0, -0.1, 0.0), vec3(0.0, 0.2, 0.0), 0.19);
      
      // Waist/Stomach
      vec3 waistPos = q - vec3(hipShift * 0.5, 1.15, 0.0);
      float dWaist = sdCapsule(waistPos, vec3(0.0, -0.1, 0.0), vec3(0.0, 0.1, 0.0), 0.145);
      
      // Chest/Bust
      vec3 chestPos = q - vec3(shoulderShift, 1.35, 0.0);
      float dChest = sdCapsule(chestPos, vec3(-0.1, 0.0, 0.0), vec3(0.1, 0.0, 0.0), 0.15);
      float dBust = length(chestPos - vec3(0.0, -0.02, 0.09)) - 0.17; 
      
      // 3. Toga / Sash across chest
      // A band going from left shoulder to right hip
      vec3 sashP = q - vec3(shoulderShift * 0.5, 1.25, 0.09);
      // Rotate sash
      float sashAng = 0.6; 
      float cs = cos(sashAng); float ss = sin(sashAng);
      vec2 sashRot = mat2(cs, -ss, ss, cs) * sashP.xy;
      float dSash = sdBox(vec3(sashRot.x, sashRot.y, sashP.z), vec3(0.25, 0.05, 0.02));
      // Add texture to sash
      dSash += sin(sashP.x * 25.0) * 0.004;
      
      // 4. Arms
      // Left arm (resting on hip)
      vec3 armLStart = vec3(shoulderShift - 0.2, 1.35, 0.0);
      vec3 armLEnd = vec3(hipShift - 0.25, 0.95, 0.08);
      float dArmL = sdCapsule(q, armLStart, armLEnd, 0.055);
      
      // Right arm (hanging down elegantly)
      vec3 armRStart = vec3(shoulderShift + 0.2, 1.35, 0.0);
      vec3 armREnd = vec3(shoulderShift + 0.28, 0.85, 0.1);
      float dArmR = sdCapsule(q, armRStart, armREnd, 0.055);

      // 5. Head & Neck
      vec3 neckPos = q - vec3(shoulderShift * 0.5, 1.5, 0.0);
      float dNeck = sdCapsule(neckPos, vec3(0.0, 0.0, 0.0), vec3(0.0, 0.12, 0.0), 0.065);
      
      vec3 headPos = q - vec3(shoulderShift * 0.3, 1.70, 0.02);
      // Slightly elongated head for classical look
      float dHeadBase = sdCapsule(headPos, vec3(0.0, -0.05, 0.0), vec3(0.0, 0.05, 0.0), 0.11);
      
      // Face Profile (Nose)
      vec3 noseP = headPos - vec3(0.0, 0.0, 0.11);
      float dNose = sdBox(noseP, vec3(0.015, 0.03, 0.02));
      // Smooth nose blend
      
      // Hair Bun
      vec3 bunP = headPos - vec3(0.0, 0.08, -0.09);
      float dBun = length(bunP) - 0.07;
      
      // Hair Texture (Wavy)
      float hairTex = (sin(headPos.x * 40.0) + sin(headPos.y * 40.0)) * 0.005;
      
      float dHeadFinal = smin(dHeadBase, dBun, 0.04);
      dHeadFinal = smin(dHeadFinal, dNose, 0.03);
      
      // Apply hair texture to top/back area
      if (headPos.y > -0.05 || headPos.z < 0.0) dHeadFinal -= hairTex;
      
      // -- Assembly --
      // Start with Skirt
      float dBody = dSkirt;
      // Smooth blend hips into skirt
      dBody = smin(dBody, dHips, 0.08);
      dBody = smin(dBody, dWaist, 0.1);
      dBody = smin(dBody, dChest, 0.08);
      dBody = smin(dBody, dBust, 0.08);
      dBody = smin(dBody, dNeck, 0.05);
      dBody = smin(dBody, dHeadFinal, 0.05);
      dBody = smin(dBody, dArmL, 0.05);
      dBody = smin(dBody, dArmR, 0.05);
      
      // Add Sash (Min blend for sharper cloth edges on skin)
      dBody = min(dBody, dSash);

      return min(dPedestal, dBody);
  }
  
  // 4. Armchair (Black Lodge Style)
  float sdChair(vec3 p) {
      // Dimensions roughly
      // Seat height 0.45
      
      // Base cushion
      float dSeat = sdRoundBox(p - vec3(0.0, 0.35, 0.0), vec3(0.35, 0.15, 0.35), 0.05);
      
      // Back Rest
      float dBack = sdRoundBox(p - vec3(0.0, 0.75, -0.32), vec3(0.35, 0.35, 0.08), 0.05);
      
      // Arm Left
      float dArmL = sdRoundBox(p - vec3(-0.35, 0.55, 0.0), vec3(0.08, 0.35, 0.35), 0.05);
      
      // Arm Right
      float dArmR = sdRoundBox(p - vec3( 0.35, 0.55, 0.0), vec3(0.08, 0.35, 0.35), 0.05);
      
      // Solid bottom (legs hidden or blocky)
      float dBase = sdBox(p - vec3(0.0, 0.1, 0.0), vec3(0.32, 0.1, 0.32));
      
      // Smooth union for upholstery look
      float d = smin(dSeat, dBack, 0.05);
      d = smin(d, dArmL, 0.05);
      d = smin(d, dArmR, 0.05);
      
      return min(d, dBase);
  }
  
  float sdChairs(vec3 p) {
      // Chair 1 (Right side)
      vec3 p1 = p - vec3(2.2, 0.0, 1.0);
      // Rotate inwards and Face Camera (180 deg / PI)
      float ang1 = PI - 0.5;
      float c1 = cos(ang1); float s1 = sin(ang1);
      p1.xz = mat2(c1, -s1, s1, c1) * p1.xz;
      float d1 = sdChair(p1);
      
      // Chair 2 (Left side)
      vec3 p2 = p - vec3(-2.2, 0.0, 1.0);
      // Rotate inwards and Face Camera (180 deg / PI)
      float ang2 = PI + 0.5;
      float c2 = cos(ang2); float s2 = sin(ang2);
      p2.xz = mat2(c2, -s2, s2, c2) * p2.xz;
      float d2 = sdChair(p2);
      
      return min(d1, d2);
  }
  
  // 5. Floor Lamp
  // Returns vec2(distance, material_sub_id)
  // ID 5.0 = Stand (Metal)
  // ID 6.0 = Shade (Fabric/Lit)
  vec2 sdLamp(vec3 p) {
      // Position: Next to Left Chair
      vec3 pos = p - vec3(-3.8, 0.0, 1.2);
      
      // Base (Tiered cylinder/cone)
      float dBase1 = sdCappedCone(pos - vec3(0.0, 0.02, 0.0), 0.02, 0.28, 0.25);
      float dBase2 = sdCappedCone(pos - vec3(0.0, 0.06, 0.0), 0.02, 0.20, 0.05); // Taper up to stem
      
      // Stem (Thin cylinder)
      // Goes from base up to start of shade
      float dStem = sdCapsule(pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.40, 0.0), 0.025);
      
      // Trumpet Shade Construction
      // We want a curve that goes from stem radius to wide radius
      // We can approximate with 2 stacked cones and smooth blend (smin)
      
      // Cone 1: Neck (Stem to mid-width)
      // Center y relative to pos
      float h1 = 0.15;
      float r1_bot = 0.03;
      float r1_top = 0.12;
      // y position: 1.40 + h1 = 1.55
      float dShade1 = sdCappedCone(pos - vec3(0.0, 1.55, 0.0), h1, r1_bot, r1_top);
      
      // Cone 2: Flare (Mid-width to wide top)
      float h2 = 0.25;
      float r2_bot = 0.12; // Matches top of cone 1
      float r2_top = 0.23; // REDUCED from 0.45 (Narrower trumpet)
      // y position: 1.55 + h1 + h2 = 1.95
      float dShade2 = sdCappedCone(pos - vec3(0.0, 1.95, 0.0), h2, r2_bot, r2_top);
      
      // Combine Shade parts with smooth blend for curved look
      float dShade = smin(dShade1, dShade2, 0.04);
      
      // Combine Metal parts
      float dMetal = min(dBase1, dBase2);
      dMetal = min(dMetal, dStem);
      
      if (dShade < dMetal) {
          return vec2(dShade, 6.0);
      }
      return vec2(dMetal, 5.0);
  }

  // Combined Map
  // Returns vec2(distance, material_id)
  // ID 1.0 = Floor
  // ID 2.0 = Curtains
  // ID 3.0 = Statue
  // ID 4.0 = Chairs
  // ID 5.0 = Lamp Stand
  // ID 6.0 = Lamp Shade
  vec2 map(vec3 p) {
      float dFloor = sdFloor(p);
      float dCurtains = sdCurtains(p);
      float dStatueObj = sdStatue(p);
      float dChairsObj = sdChairs(p);
      
      // Start with floor
      vec2 res = vec2(dFloor, 1.0);
      
      // Combine strict minimums for distance
      if (dCurtains < res.x) res = vec2(dCurtains, 2.0);
      if (dStatueObj < res.x) res = vec2(dStatueObj, 3.0);
      if (dChairsObj < res.x) res = vec2(dChairsObj, 4.0);
      
      // Lamp Check
      vec2 lampRes = sdLamp(p);
      if (lampRes.x < res.x) res = lampRes;
      
      return res;
  }

  // --- Raymarching ---
  vec2 rayMarch(vec3 ro, vec3 rd) {
      float dO = 0.0;
      float id = 0.0;
      
      for(int i=0; i<MAX_STEPS; i++) {
          vec3 p = ro + rd * dO;
          vec2 dS = map(p);
          dO += dS.x;
          id = dS.y;
          if(dO > MAX_DIST || abs(dS.x) < SURF_DIST) break;
      }
      return vec2(dO, id);
  }

  // --- Normals ---
  vec3 getNormal(vec3 p) {
      float d = map(p).x;
      vec2 e = vec2(0.01, 0.0);
      vec3 n = d - vec3(
          map(p-e.xyy).x,
          map(p-e.yxy).x,
          map(p-e.yyx).x
      );
      return normalize(n);
  }

  // --- Materials ---

  float getChevronPattern(vec2 uv) {
      float scale = 1.0;
      vec2 p = uv * scale;
      
      // Classic Twin Peaks Chevron
      float tileY = floor(p.y);
      float tileX = p.x;
      
      // Flip direction every row
      float dir = mod(tileY, 2.0) > 0.5 ? 1.0 : -1.0;
      
      // The pattern value
      float val = fract(tileX + p.y * dir);
      
      return smoothstep(0.5 - 0.02, 0.5 + 0.02, val);
  }

  // --- Main Render ---
  vec3 render(vec3 ro, vec3 rd) {
      vec2 d = rayMarch(ro, rd);
      float t = d.x;
      float mat = d.y;
      
      vec3 col = vec3(0.0);
      
      if(t < MAX_DIST) {
          vec3 p = ro + rd * t;
          vec3 n = getNormal(p);
          vec3 r = reflect(rd, n);
          
          // Lights
          vec3 lightPos = vec3(0.0, 5.0, -2.0);
          // Moving light
          lightPos.x += sin(u_time * 0.5) * 3.0;
          
          vec3 l = normalize(lightPos - p);
          float diff = max(dot(n, l), 0.0);
          
          // Shadows (raymarched soft shadow would be expensive, let's fake it or skip)
          // Ambient
          float amb = 0.1;
          
          if(mat == 1.0) { 
              // --- FLOOR MATERIAL ---
              float pattern = getChevronPattern(p.xz);
              vec3 cWhite = vec3(0.9, 0.85, 0.75); // Cream
              vec3 cBlack = vec3(0.05, 0.02, 0.02); // Dark Brown/Black
              
              vec3 albedo = mix(cBlack, cWhite, pattern);
              
              // Floor Reflection (Recursive Raymarch - Single Bounce)
              vec3 refDir = reflect(rd, n);
              vec2 refD = rayMarch(p + n * 0.05, refDir);
              if (refD.y == 2.0 && refD.x < MAX_DIST) {
                  // Hit curtains in reflection
                  vec3 refP = p + n * 0.05 + refDir * refD.x;
                  vec3 refN = getNormal(refP);
                  float refDiff = max(dot(refN, l), 0.0);
                  
                  // Simple Curtain Color for reflection
                  float fresnel = pow(1.0 - max(dot(refN, -refDir), 0.0), 3.0);
                  vec3 curtainCol = vec3(0.3, 0.0, 0.0) * (refDiff + 0.2) + fresnel * 0.5;
                  
                  // Mix reflection based on Fresnel of floor
                  float floorFresnel = 0.1 + 0.5 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
                  albedo = mix(albedo, curtainCol, floorFresnel * 0.8);
              }

              col = albedo * (diff + amb);
              
              // Specular highlight on floor
              float spec = pow(max(dot(r, l), 0.0), 32.0);
              col += spec * 0.2;

          } else if (mat == 2.0) {
              // --- CURTAIN MATERIAL ---
              // Velvet shader
              vec3 red = vec3(0.25, 0.01, 0.01);
              
              float viewDot = max(dot(n, -rd), 0.0);
              float rim = 1.0 - viewDot;
              rim = pow(rim, 2.0); // Velvet falloff
              
              // Fabric noise texture for roughness
              float fabric = fbm(p.xy * 10.0) * 0.1;
              
              vec3 finalColor = red * (diff * 0.5 + amb);
              finalColor += vec3(0.8, 0.1, 0.1) * rim * 0.8;
              finalColor *= (0.5 + 0.5 * diff);
              
              col = finalColor;
          } else if (mat == 3.0) {
              // --- STATUE MATERIAL ---
              // Marble
              vec3 marbleBase = vec3(0.95, 0.92, 0.88);
              float vein = fbm(p.xy * 8.0 + p.z * 4.0);
              vec3 colMarble = marbleBase * (0.9 + 0.1 * vein);
              
              // Soft lighting
              float diffStatue = diff * 0.6 + 0.4 * pow(max(dot(n, l), 0.0), 2.0); 
              
              vec3 finalCol = colMarble * (diffStatue + amb);
              
              // Specular
              float specStatue = pow(max(dot(r, l), 0.0), 64.0);
              finalCol += vec3(1.0) * specStatue * 0.3;
              
              col = finalCol;
          } else if (mat == 4.0) {
              // --- CHAIR MATERIAL ---
              // Black Leather
              vec3 leatherBase = vec3(0.02, 0.02, 0.025);
              
              // Leather bumps
              float leatherNoise = noise(p.xy * 30.0 + p.z * 30.0) * 0.05;
              
              // Lighting
              // Leather has distinct broad specular but dark diffuse
              float diffChair = diff * 0.4 + amb;
              vec3 finalCol = leatherBase * diffChair;
              
              // Leather Specular (Broad and slightly bluish/white)
              float specChair = pow(max(dot(r, l), 0.0), 16.0);
              // Fresnel for edges
              float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
              
              finalCol += vec3(0.3) * specChair * 0.5;
              finalCol += vec3(0.1) * fresnel;
              
              col = finalCol;
          } else if (mat == 5.0 || mat == 6.0) {
              // --- LAMP (Chrome) ---
              vec3 chromeBase = vec3(0.05); // Dark base, mostly reflection
              
              // Calculate Reflection
              vec3 refDir = reflect(rd, n);
              // Use a shorter reflection step count for performance if possible, but standard is fine
              vec2 refD = rayMarch(p + n * 0.02, refDir);
              
              vec3 refCol = vec3(0.02); // Default dark environment
              
              if (refD.x < MAX_DIST) {
                  float m = refD.y;
                  if (m == 2.0) { // Curtains
                       refCol = vec3(0.4, 0.0, 0.0); // Red reflection
                  } else if (m == 1.0) { // Floor
                       refCol = vec3(0.6, 0.5, 0.4); // Floor reflection
                  }
              }
              
              // Add some fake environment light (overhead strip)
              float strip = smoothstep(0.9, 0.95, dot(refDir, vec3(0.0, 1.0, 0.0)));
              refCol += vec3(1.0) * strip;

              float diffChrome = diff * 0.2; // Metal has low diffuse
              float specChrome = pow(max(dot(r, l), 0.0), 32.0);
              float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
              
              col = chromeBase + refCol * (0.8 + fresnel) + vec3(1.0) * specChrome;
          }
          
          // Distance Fog (Pitch black darkness)
          float fog = 1.0 - exp(-0.001 * t * t);
          col = mix(col, vec3(0.0), fog);
          
      } else {
          col = vec3(0.0); // Background black
      }
      
      return col;
  }

  void main() {
    // UV Setup
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    // Camera setup
    float camRadius = 8.0;
    float camSpeed = u_time * 0.1;
    
    // Floating camera movement (Dreamy)
    vec3 ro = vec3(sin(camSpeed)*0.5, 1.8 + sin(u_time*0.5)*0.2, -6.0 + cos(u_time*0.2));
    
    // LookAt
    vec3 ta = vec3(0.0, 1.5, 0.0);
    vec3 w = normalize(ta - ro);
    vec3 u = normalize(cross(w, vec3(0.0, 1.0, 0.0)));
    vec3 v = cross(u, w);
    
    // Mouse look
    vec2 m = (u_mouse / u_resolution - 0.5) * 2.0;
    ro.x += m.x * 2.0;
    ro.y += m.y * 1.0;
    
    // Re-calculate view vectors after mouse offset
    w = normalize(ta - ro);
    u = normalize(cross(w, vec3(0.0, 1.0, 0.0)));
    v = cross(u, w);
    
    vec3 rd = normalize(u * uv.x + v * uv.y + w * 1.5); // 1.5 is zoom/FOV

    // Distortion/Warp (The Lynch Effect)
    // Subtle wobbling of space
    rd.x += sin(uv.y * 10.0 + u_time) * 0.001;

    // Render Scene
    vec3 col = render(ro, rd);

    // --- Post Processing ---

    // 1. Electricity / Red Room Flicker
    // Create an erratic time signal
    float flickTime = u_time * 10.0;
    float flickRandom = hash(vec2(floor(flickTime), 99.0));
    // Trigger occasionally (5% chance)
    float flickTrigger = step(0.95, flickRandom);
    // Intensity varies
    float flickIntensity = flickTrigger * (0.2 + 0.3 * hash(vec2(u_time, 1.0)));
    
    // Apply Red Shift and Contrast Boost
    vec3 redShift = vec3(col.r * 1.5 + 0.1, col.g * 0.7, col.b * 0.7);
    // Mix based on intensity
    col = mix(col, redShift, flickIntensity);

    // 2. Film Grain
    float grain = hash(uv * u_time * 10.0) * 0.08;
    col += grain;
    
    // 3. Color Grading (Technicolor/Warm)
    col = pow(col, vec3(0.9, 0.85, 0.8)); // Gamma correction + Tint
    col *= vec3(1.1, 1.0, 0.95); // Warmth
    
    // 4. Vignette
    float vig = length(uv);
    col *= smoothstep(1.2, 0.4, vig);
    
    // 5. Glow/Bloom approximation (very cheap)
    float brightness = dot(col, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > 0.6) col += col * 0.2;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const LynchBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try to get WebGL context with derivative extension support if possible
    let gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Enable standard derivatives for fwidth if available (makes checkboard pattern smoother)
    const ext = gl.getExtension('OES_standard_derivatives');

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      // Add extension enable directive if using WebGL 1
      let fullSource = source;
      if (ext && type === gl.FRAGMENT_SHADER) {
          fullSource = '#extension GL_OES_standard_derivatives : enable\n' + source;
      }
      
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, fullSource);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = (time: number) => {
      timeRef.current = time * 0.001;

      // Ensure canvas is full res
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      }

      gl!.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl!.uniform1f(timeUniformLocation, timeRef.current);
      gl!.uniform2f(mouseUniformLocation, mouseX, canvas.height - mouseY);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
      if (gl && program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block"
    />
  );
};

export default LynchBackground;