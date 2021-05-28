import * as React from 'react';
import Peer from 'peerjs';
import { nanoid } from 'nanoid';

import { handle, Message, PlayerId, EngineState } from './Engine';
import { Cell } from './model';

// This probably doesn't need to be a hook
export const useHostGame = () => {
  const [owner] = React.useState(() => nanoid() as PlayerId);

  const state = React.useRef<EngineState>({
    type: 'lobby',
    owner,
    players: []
  });

  React.useEffect(() => {
    const peer = new Peer(owner);
    const connections: Peer.DataConnection[] = [];

    peer.on('open', (...args) => console.log('useHostGame', 'open', args));

    peer.on('connection', (conn) => {
      console.log('useHostGame: Recevied new connection', conn);
      connections.push(conn);
      console.log(connections.length);

      conn.on('data', (msg: Message) => {
        console.log('useHostGame: Recevied data', conn, msg);
        const nextState = handle(state.current, msg);
        console.log(state, nextState);
        connections.forEach(c => c.send(nextState));
        state.current = nextState;
      })
    })

    return () => peer.destroy();
  }, [owner]);

  return owner;
}

export const useJoinGame = (host: PlayerId, guest: PlayerId) => {
  const conn = React.useRef<Peer.DataConnection>();
  const [state, setState] = React.useState<EngineState>({
    type: 'lobby',
    owner: host,
    players: []
  });

  React.useEffect(() => {
    const peer = new Peer(guest === host ? `${guest}-host-guest` : guest);
    peer.on('open', () => {
      console.log('useJoinGaon: onOpen')
      conn.current = peer.connect(host);

      conn.current?.on('data', (data)  => {
      console.log('useJoinGaon: onData', data);
      setState(data);
      });

      conn.current?.on('open', () => {
        conn.current?.send({
          type: 'join',
          playerId: guest
        });
      })
    })


    return () => peer.destroy();
  }, [guest, host]);

  const start = () => conn.current?.send({
    type: 'start'
  });

  const move = (path: Cell.Path) => conn.current?.send({
    type: 'move',
    path,
  })

  return { state, start, move };
}