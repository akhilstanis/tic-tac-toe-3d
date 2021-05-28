import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import * as React from 'react';
import { useParams } from 'react-router';
import { Grid } from '../three/Grid';
import { Cell, EMPTY_CELLS, Path } from '../three/model';
import { PlayerId, EngineState } from './Engine';
import { useJoinGame } from './Network';
import { assertNever } from './utils';

interface Props {
  me: PlayerId;
}

interface RouteParams {
  host: PlayerId;
}

export const Container: React.FC<Props> = (props) => {
  const { host } = useParams<RouteParams>();
  const { state, start, move } = useJoinGame(host, props.me);

  return <Flex height="100%">
    <Box flex="3" height="100%">
      <Grid
        cells={getCells(state)}
        isWinner={() => false}
        onClick={getOnClick(props.me, state, move)}
      />
    </Box>
    <Box flex="1" height="100%" borderLeft="#eee 2px solid" padding="10px">
      <Heading>Tic Tac Toe 3D</Heading>
      <ul>
        {state.players.map(player => <li key={player.color} style={{ color: player.color }}>{player.color}</li>)}
      </ul>
      {state.type === 'lobby' && state.owner === props.me && <Button onClick={start}>Start</Button>}
    </Box>
  </Flex>;
}

const getCells = (state: EngineState): Cell[][][] => {
  switch(state.type) {
    case 'lobby':
      return EMPTY_CELLS;
    case 'game':
    case 'end':
      const playersByColor = Object.fromEntries(state.players.map(player => [player.id, player.color]));
      return state.grid.map(x => x.map(y => y.map(z => ({ color: z.type === 'empty' ? 'green' : playersByColor[z.player] }))));
    default:
      return assertNever(state);
  }
}

const getOnClick = (me: PlayerId, state: EngineState, move: (path: Path) => void) => {
  switch(state.type) {
    case 'lobby':
    case 'end':
      return () => false;
    case 'game':
      return state.currentTurn === me ? move : () => false;
    default:
      return assertNever(state);
  }
}
