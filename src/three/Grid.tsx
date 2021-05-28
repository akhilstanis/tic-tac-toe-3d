import * as React from 'react'
import { Canvas } from '@react-three/fiber'

import { CameraControls } from './CameraControls';
import { Cube } from './Cube';

import { Cell, Path } from './model';


interface Props {
  cells: Cell[][][];
  isWinner: (path: Path) => boolean;
  onClick: (path: Path) => void;
}

export const Grid : React.FC<Props> = (props) => {
  const cells = props.cells.flatMap((rows, z) => {
    return rows.flatMap((cols, y) => {
      return cols.flatMap((cell, x) => <CellComponent
        key={[z,y,x].join()}
        color={cell.color}
        path={[z,y,x]}
        onClick={props.onClick} 
        winner={props.isWinner([z,y,x])}
      />)
    })
  });

  return <Canvas camera={{ position: [9,9,9] }}>
    <CameraControls/>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <group>{cells}</group>
  </Canvas>
};

interface CellProps extends Cell {
  onClick: (path: Path) => void;
  winner: boolean;
  path: Path;
}

const CellComponent: React.FC<CellProps>= (props) => {
  return <Cube
    position={path2Position(props.path)}
    onClick={() => props.onClick(props.path)}
    color={props.color}
    borderWidth={4}
    borderColor={props.winner ? 'black' : 'white'}
  />
}

type Position = Path;
const path2Position = ([z, y, x]: Path): Position => [x * 2, y * 2, z * 2];
