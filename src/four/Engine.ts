import { Cell, Grid, play } from "./model";
import { assertNever } from "./utils";

export type PlayerId = string & { __playerId: any };
export type Player = {
  id: PlayerId;
  color: string;
}

const COLORS = ['red', 'blue', 'yellow'];

interface Base {
  players: Player[];
  owner: PlayerId;
}

interface Lobby extends Base {
  type: 'lobby';
};

interface Game extends Base {
  type: 'game';

  grid: Grid;
  currentTurn: PlayerId;
};

interface End extends Base {
  type: 'end';

  grid: Grid;
  winner?: PlayerId;
};

export type Result = Tie | Won | NotOver;

type Tie = { type: 'tie' };

type Won = {
  type: 'won';
  winner: PlayerId;
}

type NotOver = { type: 'notOver' };

export type EngineState = Lobby | Game | End;

type Join = {
  type: 'join';
  playerId: PlayerId;
};

type Start = {
  type: 'start';
};

export type Move = {
  type: 'move';
  path: Cell.Path;
};

export type Message = Join | Start | Move;

export const handle = (state: EngineState, msg: Message): EngineState => {
  switch (state.type) {
    case 'lobby':
      switch (msg.type) {
        case 'join':
          return {
            ...state,
            players: [...state.players, {
              id: msg.playerId,
              color: COLORS[state.players.length]
            }]
          };

        case 'start':
          return {
            type: 'game',
            grid: Grid.BLANK,
            currentTurn: state.players[0].id,
            players: state.players,
            owner: state.owner
          }

        default:
          throw new Error(`Received unexpected message type: ${msg.type}`);
      }

    case 'game':
      switch (msg.type) {
        case 'move':
          const result = play(state.grid, state.currentTurn, msg.path);
          console.log({ result })
          switch (result.type) {
            case 'nextTurn':
              const currentPlayerIdx = state.players.findIndex(player => player.id === state.currentTurn);
              console.log('currentPlayrIdx', currentPlayerIdx, (currentPlayerIdx + 1) % state.players.length)
              return {
                ...state,
                grid: result.grid,
                currentTurn: state.players[
                  (currentPlayerIdx + 1) % state.players.length
                ].id
              }
            case 'victory':
            case 'tie':
              return {
                ...state,
                type: 'end',
                grid: result.grid,
              }
            default:
              return assertNever(result);
          }

        default:
          throw new Error(`Received unexpected message type: ${msg.type}`);
      }

    case 'end':
      throw new Error(`Received unexpected message type: ${msg.type}`);
    default:
      return assertNever(state);
  }
}