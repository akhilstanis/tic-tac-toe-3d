import produce from "immer";
import { difference, first, map, sample, shuffle, times } from "lodash";

type PlayerId = string;

type Player = {
  id: PlayerId;
  name: string;
}

type SessionPlayer = Player & {
  color: string;
}

export type Cell = {
  color: string;
};

declare namespace Game {
  type Base = {
    owner: Player;
    players: SessionPlayer[];
    cells: Cell[][][];
  }

  type Waiting = Base & {
    type: 'waitingRoom';
  }

  type Playing = Base & {
    type: 'playing';
    turn: PlayerId;
  }

  type Tied = Base & {
    type: 'tied';
  }

  type Won = Base & {
    type: 'won'
    winner: PlayerId;
    winningPaths: Path[];
    cells: unknown[];
  }

  export type Game = Waiting | Playing | Tied | Won;
}
export type Game = Game.Game;


type Message = JoinMessage | StartMessage | PlayMessage;

type JoinMessage = {
  type: 'join';
  player: Player;
}

type StartMessage = {
  type: 'start';
}

export type Path = [number, number, number];

type PlayMessage = {
  type: 'play';
  path: Path;
}

const processMessage = (authorId: PlayerId, message: Message, game: Game): Game => {
  switch(game.type) {
    
    case 'waitingRoom':
      switch(message.type) {
        case 'join':
          if (authorId !== message.player.id) {
            return game;
          }

          const existingPlayer = game.players.find(player => player.id === message.player.id);
          if (existingPlayer) {
            return game;
          }

          return {
            ...game,
            players: [...game.players, {
              ...message.player,
              color: sample(difference(COLORS, map(game.players, 'color')))!
            }]
          };
        
        case 'start':
          if (authorId !== game.owner.id) {
            return game;
          }

          const shuffledPlayers = shuffle(game.players);
          return {
            ...game,
            type: 'playing',
            players: shuffle(game.players),
            turn: first(shuffledPlayers)!.id
          }

        default:
          return game;
      }

    case 'playing':
      switch(message.type) {
        case 'play':
          if (authorId !== game.turn) {
            return game;
          }

          const playerIndex = game.players.findIndex(player => player.id === authorId);
          const playerColor = game.players[playerIndex].color;

          const [z, y, x] = message.path;
          const cells = produce(game.cells, draft => {
            draft[z][y][x].color = playerColor;
          })

          return {
            ...game,
            cells,
            turn: game.players[(playerIndex + 1) % game.players.length].id
          }

        default:
          return game;
      }
  }
  return game;
}


const COLORS = ['red', 'blue'];

export const EMPTY_CELLS: Cell[][][] = times(3, z => times(3, y => times(3, x => ({ color: 'green' }))));

// const setUpGame = () => {
//   const game: Game = {
//     type: 'waitingRoom',
//     cells: 
//   } 
//   const peer = new Peer();

//   const publish = (game: any) => {
//     Object.values<Peer.DataConnection>(peer.connections).map(conn => {
//       conn.send(game);
//     });
//   }

//   peer.on('connection', conn => {
//     conn.on('data', data => {
//       wrapper.game = processMessage(data);
//       publish(wrapper.game);
//     });
//   })

//   return peer
// }

// const useHostGame = () => {
//   const [hostId, setHostId] = React.useState<string | undefined>();

//   React.useEffect(() => {
//     const peer = setUpGame();
//     setHostId(hostId);

//     return () => peer.destroy();
//   });

//   return hostId;
// }

// const useJoinGame = (id: string | undefined) => {
//   const [game, setGame] = React.useState<any>({});
//   const connection = React.useRef<Peer.DataConnection>();

//   const sendMessage = (msg: any) => connection.current?.send(msg);

//   React.useEffect(() => {
//     if (!id) {
//       return;
//     }

//     const peer = new Peer();
//     const conn = peer.connect(id);

//     conn.on('open', () => {
//       connection.current = conn;
//       sendMessage(`join as ${peer.id}`);
//     });

//     conn.on('data', (data) => {
//       setGame(data);
//     })

//     return () => peer.destroy();
//   }, [id])

//   return { game, sendMessage };
// }

// const processMessage = (message: any) => ({});