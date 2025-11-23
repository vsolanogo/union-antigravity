import React from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useState } from 'react';

// A secondary "Dust" field for extra depth beyond the standard Stars component
const StarField: React.FC = () => {
  // @ts-ignore
  const [sphere] = useState(() => random.inSphere(new Float32Array(3000), { radius: 250 }));

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points positions={sphere as Float32Array} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#88aaff"
          size={0.4}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
};

export default StarField;