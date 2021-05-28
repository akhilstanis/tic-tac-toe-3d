import * as React from 'react';
import * as ReactThreeFiber from "@react-three/fiber";
import { BoxBufferGeometry } from 'three';

interface CubeProps extends ReactThreeFiber.MeshProps {
  color?: ReactThreeFiber.MeshStandardMaterialProps['color'];
  borderColor: ReactThreeFiber.LineBasicMaterialProps['color'];
  borderWidth: ReactThreeFiber.LineBasicMaterialProps['linewidth'];
}

const BOX_BUFFER_GEOMETRY = new BoxBufferGeometry(1,1,1);

export const Cube: React.FC<CubeProps> = (props) => {
  
  return <group>
    <mesh
      {...props}
      scale={[1, 1, 1]}
      onClick={withOutPropagation(props.onClick)}
      geometry={BOX_BUFFER_GEOMETRY}
    >
      <meshStandardMaterial color={props.color} />
    </mesh>
    {<lineSegments renderOrder={1} position={props.position}>
      <edgesGeometry args={[BOX_BUFFER_GEOMETRY]}/>
      <lineBasicMaterial color={props.borderColor} linewidth={props.borderWidth}/>
    </lineSegments>}
  </group>;
}

const withOutPropagation = (handler: ReactThreeFiber.MeshProps['onClick']): ReactThreeFiber.MeshProps['onClick'] => {
  if (handler) {
    return (e) => {
      e.stopPropagation();
      handler(e);
    }
  }
}