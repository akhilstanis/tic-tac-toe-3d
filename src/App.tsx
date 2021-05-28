import React from 'react';

import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { useHostGame } from './four/Network';
import { Container } from './four/Container';


const App = () => {
  const owner = useHostGame();

  return <ChakraProvider>
    <BrowserRouter>
      <Switch>
        <Route path="/:host">
          <Container me={owner}/>
        </Route>
        <Route path="/">
          <Redirect to={`/${owner}`}/>
        </Route>
      </Switch>
    </BrowserRouter>
  </ChakraProvider>
}

export default App;
