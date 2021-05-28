import produce from "immer";
import { uniq, curry, identity, times, first } from "lodash";

type Truple<T> = [T, T, T];

export namespace Cell {
  export type Empty = { 
    type: 'empty';
  };
  
  export type Occupied = { 
    type: 'occupied', 
    player: string 
  };
  
  export type Path = Truple<number>;

  export const EMPTY: Empty = { type: 'empty' };
  export const isOccupied = (t: Cell): t is Occupied => t.type === 'occupied';
}
type Cell = Cell.Empty | Cell.Occupied;

export namespace Grid {
  export const BLANK = times(3, z => times(3, y => times(3, x => Cell.EMPTY))) as Grid;
}
export type Grid = Truple<Truple<Truple<Cell>>>;

type BasePlayResult = {
  grid: Grid;
}

interface NextTurn extends BasePlayResult { 
  type: 'nextTurn'; 
};

interface Tie extends BasePlayResult { 
  type: 'tie';
};

interface Victory extends BasePlayResult {
  type: 'victory',
  winner: string;
  winningTiles: Cell.Path[];
}

type PlayResult = NextTurn | Victory | Tie;

export const play = (board: Grid, player: string, [x, y, z]: Cell.Path): PlayResult => {
  if (Cell.isOccupied(board[x][y][z])) {
    console.warn(`Tile at path ${[x,y,z]} is already played`);
    return {
      type: 'nextTurn',
      grid: board
    }
  }

  const nextBoard = produce(board, draft => {
    draft[x][y][z] = {
      type: 'occupied',
      player
    }
  });

  if (isTied(nextBoard)) {
    return {
      type: 'tie',
      grid: nextBoard
    };
  }

  const winningPath = getWinningPath(nextBoard);
  if (winningPath) {
    const winningCell = getCell(nextBoard, [x,y,z]);
    if (!Cell.isOccupied(winningCell)) {
      throw new Error('Expected just played cell to be the winning');
    }

    return {
      type: "victory",
      grid: nextBoard,
      winningTiles: winningPath,
      winner: winningCell.player
    }
  }

  return {
    type: 'nextTurn',
    grid: nextBoard
  }
}

type WinningPath = [Cell.Path, Cell.Path, Cell.Path];
const floors: WinningPath[] = [[[2, 0, 0], [2, 0, 1], [2, 0, 2]], [[1, 0, 0], [1, 0, 1], [1, 0, 2]], [[0, 0, 0], [0, 0, 1], [0, 0, 2]], [[0, 0, 0], [1, 0, 0], [2, 0, 0]], [[0, 0, 1], [1, 0, 1], [2, 0, 1]], [[0, 0, 2], [1, 0, 2], [2, 0, 2]], [[2, 0, 0], [1, 0, 1], [0, 0, 2]], [[0, 0, 0], [1, 0, 1], [2, 0, 2]], [[2, 1, 0], [2, 1, 1], [2, 1, 2]], [[1, 1, 0], [1, 1, 1], [1, 1, 2]], [[0, 1, 0], [0, 1, 1], [0, 1, 2]], [[0, 1, 0], [1, 1, 0], [2, 1, 0]], [[0, 1, 1], [1, 1, 1], [2, 1, 1]], [[0, 1, 2], [1, 1, 2], [2, 1, 2]], [[2, 1, 0], [1, 1, 1], [0, 1, 2]], [[0, 1, 0], [1, 1, 1], [2, 1, 2]], [[2, 2, 0], [2, 2, 1], [2, 2, 2]], [[1, 2, 0], [1, 2, 1], [1, 2, 2]], [[0, 2, 0], [0, 2, 1], [0, 2, 2]], [[0, 2, 0], [1, 2, 0], [2, 2, 0]], [[0, 2, 1], [1, 2, 1], [2, 2, 1]], [[0, 2, 2], [1, 2, 2], [2, 2, 2]], [[2, 2, 0], [1, 2, 1], [0, 2, 2]], [[0, 2, 0], [1, 2, 1], [2, 2, 2]]];
const fronts: WinningPath[] = [[[2, 0, 0], [2, 0, 1], [2, 0, 2]], [[2, 1, 0], [2, 1, 1], [2, 1, 2]], [[2, 2, 0], [2, 2, 1], [2, 2, 2]], [[2, 0, 0], [2, 1, 0], [2, 2, 0]], [[2, 0, 1], [2, 1, 1], [2, 2, 1]], [[2, 0, 2], [2, 1, 2], [2, 2, 2]], [[2, 0, 0], [2, 1, 1], [2, 2, 2]], [[2, 2, 0], [2, 1, 1], [2, 0, 2]], [[1, 0, 0], [1, 0, 1], [1, 0, 2]], [[1, 1, 0], [1, 1, 1], [1, 1, 2]], [[1, 2, 0], [1, 2, 1], [1, 2, 2]], [[1, 0, 0], [1, 1, 0], [1, 2, 0]], [[1, 0, 1], [1, 1, 1], [1, 2, 1]], [[1, 0, 2], [1, 1, 2], [1, 2, 2]], [[1, 2, 2], [1, 1, 1], [1, 0, 0]], [[1, 2, 0], [1, 1, 1], [1, 0, 2]], [[0, 0, 0], [0, 0, 1], [0, 0, 2]], [[0, 1, 2], [0, 1, 1], [0, 1, 0]], [[0, 2, 0], [0, 2, 1], [0, 2, 2]], [[0, 0, 2], [0, 1, 2], [0, 2, 2]], [[0, 2, 1], [0, 1, 1], [0, 0, 1]], [[0, 0, 0], [0, 1, 0], [0, 2, 0]], [[0, 0, 2], [0, 1, 1], [0, 2, 0]], [[0, 2, 2], [0, 1, 1], [0, 0, 0]]];
const sidess: WinningPath[] = [[[0, 0, 0], [1, 0, 0], [2, 0, 0]], [[0, 1, 0], [1, 1, 0], [2, 1, 0]], [[0, 2, 0], [1, 2, 0], [2, 2, 0]], [[2, 2, 0], [2, 1, 0], [2, 0, 0]], [[1, 0, 0], [1, 1, 0], [1, 2, 0]], [[0, 2, 0], [0, 1, 0], [0, 0, 0]], [[0, 2, 0], [1, 1, 0], [2, 0, 0]], [[2, 2, 0], [1, 1, 0], [0, 0, 0]], [[0, 0, 1], [1, 0, 1], [2, 0, 1]], [[0, 1, 1], [1, 1, 1], [2, 1, 1]], [[0, 2, 1], [1, 2, 1], [2, 2, 1]], [[2, 0, 1], [2, 1, 1], [2, 2, 1]], [[1, 0, 1], [1, 1, 1], [1, 2, 1]], [[0, 2, 1], [0, 1, 1], [0, 0, 1]], [[0, 2, 1], [1, 1, 1], [2, 0, 1]], [[2, 2, 1], [1, 1, 1], [0, 0, 1]], [[0, 0, 2], [1, 0, 2], [2, 0, 2]], [[2, 1, 2], [1, 1, 2], [0, 1, 2]], [[0, 2, 2], [1, 2, 2], [2, 2, 2]], [[2, 0, 2], [2, 1, 2], [2, 2, 2]], [[1, 2, 2], [1, 1, 2], [1, 0, 2]], [[0, 0, 2], [0, 1, 2], [0, 2, 2]], [[0, 2, 2], [1, 1, 2], [2, 0, 2]], [[2, 2, 2], [1, 1, 2], [0, 0, 2]]];
const diagss: WinningPath[] = [[[2, 0, 2], [1, 1, 1], [0, 2, 0]], [[2, 2, 2], [1, 1, 1], [0, 0, 0]], [[0, 0, 2], [1, 1, 1], [2, 2, 0]], [[0, 2, 2], [1, 1, 1], [2, 0, 0]]];

const WINNING_PATHS: WinningPath[] = [...floors, ...fronts, ...sidess, ...diagss];

const getWinningPath = (board: Grid) => WINNING_PATHS.find(hasSameOccupant(board));

const hasSameOccupant = curry((board: Grid, winningPath: WinningPath) => {
  const uniqueCells = uniq(winningPath.map(getCell(board)));
  return uniqueCells.length === 1 && Cell.isOccupied(first(uniqueCells)!)
});

const getCell = curry((board: Grid, [x, y , z]: Cell.Path) => board[x][y][z]);

const isTied = (board: Grid) => board.flatMap(row => row.flatMap<Cell>(identity)).every(Cell.isOccupied);
