import { first, times, uniq } from 'lodash';
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { produce } from 'immer';

import { CameraControls } from './CameraControls';
import { Cube } from './Cube';

/**
 * Model
 */

interface Cell {
  occupant: 'none' | 'X' | 'Y';
  path: [number, number, number]
}

/**
 * Cell
 */
interface CellProps extends Cell {
  onClick: () => void;
  winner: boolean;
}


const Cell: React.FC<CellProps>= (props) => {
  return <Cube
    position={path2Position(props.path)}
    onClick={props.onClick}
    color={COLORS[props.occupant]}
    borderWidth={4}
    borderColor={props.winner ? 'black' : 'white'}
  />
}

const path2Position = ([z, y, x]: Path): Position => [x * 2, y * 2, z * 2];

const COLORS: Record<Cell['occupant'], string> = {
  'none': 'green',
  'X': 'red',
  'Y': 'blue'
}



export const Demo = () => <>
  <Canvas camera={{ position: [9,9,9] }}>
    <CameraControls/>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <Grid/>
  </Canvas>
</>;

// V2

type Path = [number, number, number];
type Position = Path;



const GRID: Cell[][][] = times(3, z => times(3, y => times(3, x => ({ occupant: 'none', path: [z, y, x]}))))

export const Grid : React.FC = () => {
  const [grid, setGrid] = React.useState<Cell[][][]>(GRID);
  const [currentPlayer, setCurrentPlayer] = React.useState<Cell['occupant']>('X');
  const [winnerPath, setWinnerPath] = React.useState<string[]>([]);

  const onClick = ([z, y, x]: Path) => () => {
    if (winnerPath.length === 3) {
      return;
    }

    const newGrid = produce(grid, draft => {
      draft[z][y][x].occupant = currentPlayer;
    });

    const winner = findWinner(newGrid);
    if (winner) {
      setWinnerPath(winner.map(path => path.join()))
    }

    setGrid(newGrid)

    setCurrentPlayer(currentPlayer === 'X' ? 'Y' : 'X');
  }

  const a = grid.flatMap((rows, z) => {
    return rows.flatMap((cols, y) => {
      return cols.flatMap((cell, x) => <Cell key={[z,y,x].join()} {...cell} onClick={onClick([z, y, x])} winner={winnerPath.includes([z,y,x].join())}/>)
    })
  });

  return <>{a}</>
}



const floors = [[[2, 0, 0], [2, 0, 1], [2, 0, 2]], [[1, 0, 0], [1, 0, 1], [1, 0, 2]], [[0, 0, 0], [0, 0, 1], [0, 0, 2]], [[0, 0, 0], [1, 0, 0], [2, 0, 0]], [[0, 0, 1], [1, 0, 1], [2, 0, 1]], [[0, 0, 2], [1, 0, 2], [2, 0, 2]], [[2, 0, 0], [1, 0, 1], [0, 0, 2]], [[0, 0, 0], [1, 0, 1], [2, 0, 2]], [[2, 1, 0], [2, 1, 1], [2, 1, 2]], [[1, 1, 0], [1, 1, 1], [1, 1, 2]], [[0, 1, 0], [0, 1, 1], [0, 1, 2]], [[0, 1, 0], [1, 1, 0], [2, 1, 0]], [[0, 1, 1], [1, 1, 1], [2, 1, 1]], [[0, 1, 2], [1, 1, 2], [2, 1, 2]], [[2, 1, 0], [1, 1, 1], [0, 1, 2]], [[0, 1, 0], [1, 1, 1], [2, 1, 2]], [[2, 2, 0], [2, 2, 1], [2, 2, 2]], [[1, 2, 0], [1, 2, 1], [1, 2, 2]], [[0, 2, 0], [0, 2, 1], [0, 2, 2]], [[0, 2, 0], [1, 2, 0], [2, 2, 0]], [[0, 2, 1], [1, 2, 1], [2, 2, 1]], [[0, 2, 2], [1, 2, 2], [2, 2, 2]], [[2, 2, 0], [1, 2, 1], [0, 2, 2]], [[0, 2, 0], [1, 2, 1], [2, 2, 2]]];
const fronts = [[[2, 0, 0], [2, 0, 1], [2, 0, 2]], [[2, 1, 0], [2, 1, 1], [2, 1, 2]], [[2, 2, 0], [2, 2, 1], [2, 2, 2]], [[2, 0, 0], [2, 1, 0], [2, 2, 0]], [[2, 0, 1], [2, 1, 1], [2, 2, 1]], [[2, 0, 2], [2, 1, 2], [2, 2, 2]], [[2, 0, 0], [2, 1, 1], [2, 2, 2]], [[2, 2, 0], [2, 1, 1], [2, 0, 2]], [[1, 0, 0], [1, 0, 1], [1, 0, 2]], [[1, 1, 0], [1, 1, 1], [1, 1, 2]], [[1, 2, 0], [1, 2, 1], [1, 2, 2]], [[1, 0, 0], [1, 1, 0], [1, 2, 0]], [[1, 0, 1], [1, 1, 1], [1, 2, 1]], [[1, 0, 2], [1, 1, 2], [1, 2, 2]], [[1, 2, 2], [1, 1, 1], [1, 0, 0]], [[1, 2, 0], [1, 1, 1], [1, 0, 2]], [[0, 0, 0], [0, 0, 1], [0, 0, 2]], [[0, 1, 2], [0, 1, 1], [0, 1, 0]], [[0, 2, 0], [0, 2, 1], [0, 2, 2]], [[0, 0, 2], [0, 1, 2], [0, 2, 2]], [[0, 2, 1], [0, 1, 1], [0, 0, 1]], [[0, 0, 0], [0, 1, 0], [0, 2, 0]], [[0, 0, 2], [0, 1, 1], [0, 2, 0]], [[0, 2, 2], [0, 1, 1], [0, 0, 0]]]
const sidess = [[[0, 0, 0], [1, 0, 0], [2, 0, 0]], [[0, 1, 0], [1, 1, 0], [2, 1, 0]], [[0, 2, 0], [1, 2, 0], [2, 2, 0]], [[2, 2, 0], [2, 1, 0], [2, 0, 0]], [[1, 0, 0], [1, 1, 0], [1, 2, 0]], [[0, 2, 0], [0, 1, 0], [0, 0, 0]], [[0, 2, 0], [1, 1, 0], [2, 0, 0]], [[2, 2, 0], [1, 1, 0], [0, 0, 0]], [[0, 0, 1], [1, 0, 1], [2, 0, 1]], [[0, 1, 1], [1, 1, 1], [2, 1, 1]], [[0, 2, 1], [1, 2, 1], [2, 2, 1]], [[2, 0, 1], [2, 1, 1], [2, 2, 1]], [[1, 0, 1], [1, 1, 1], [1, 2, 1]], [[0, 2, 1], [0, 1, 1], [0, 0, 1]], [[0, 2, 1], [1, 1, 1], [2, 0, 1]], [[2, 2, 1], [1, 1, 1], [0, 0, 1]], [[0, 0, 2], [1, 0, 2], [2, 0, 2]], [[2, 1, 2], [1, 1, 2], [0, 1, 2]], [[0, 2, 2], [1, 2, 2], [2, 2, 2]], [[2, 0, 2], [2, 1, 2], [2, 2, 2]], [[1, 2, 2], [1, 1, 2], [1, 0, 2]], [[0, 0, 2], [0, 1, 2], [0, 2, 2]], [[0, 2, 2], [1, 1, 2], [2, 0, 2]], [[2, 2, 2], [1, 1, 2], [0, 0, 2]]];
const diagss = [[[2, 0, 2], [1, 1, 1], [0, 2, 0]], [[2, 2, 2], [1, 1, 1], [0, 0, 0]], [[0, 0, 2], [1, 1, 1], [2, 2, 0]], [[0, 2, 2], [1, 1, 1], [2, 0, 0]]]

const WINNING_PATHS = [...floors, ...fronts, ...sidess, ...diagss];

const findWinner = (grid: Cell[][][], winningPaths = WINNING_PATHS) => {
  return winningPaths.find(path => {
    const occupants = path.map(([y,z,x]) => grid[y][z][x].occupant);
    return uniq(occupants).length === 1 && first(occupants) !== 'none';
  });
}