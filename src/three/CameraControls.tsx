import * as React from 'react';
import * as ReactThreeFiber from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

ReactThreeFiber.extend({ OrbitControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'orbitControls': ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
    }
  }
}

export const CameraControls = () => {  
  const { camera, gl } = ReactThreeFiber.useThree();  
  const controls = React.useRef<OrbitControls>();  
  (window as any).camera = camera;
  ReactThreeFiber.useFrame(() => controls.current?.update());  
  return <orbitControls ref={controls} args={[camera, gl.domElement]} />;
};