// In a real scenario, these would correspond to local files:
// clouds.jpg, galaxy.jpg, noise.png
// For this demo to function immediately, we use high-quality, reliable URLs.

export const ASSETS = {
  // High-quality cloud texture from Unsplash
  CLOUDS_URL: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=80', 
  
  // Deep space galaxy texture from Unsplash
  GALAXY_URL: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2000&q=80',
  
  // Standard cloud/noise texture for reliable displacement
  NOISE_URL: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lava/cloud.png', 
};

export const PORTAL_SETTINGS = {
  radius: 0.18,
  edgeSoftness: 0.05,
  glowWidth: 0.03,
  displacementStrength: 0.15,
};