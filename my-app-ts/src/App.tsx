import React from 'react';
import './App.css';
import {Card} from './components/Card';
import { Layout } from './components/Layout';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import '@chakra-ui/react'
import { ChakraProvider, Input} from '@chakra-ui/react';


function App() {
  return (
  <ChakraProvider>
    <>
      <Layout>
        <Header />
        <Card />
        <Box>
          <h1>Welcome to My App</h1>
          <p>This is a simple application using Chakra UI and React.</p>
        </Box>
        <Input placeholder="Email" />
        <Input placeholder="Password" />
        <Footer />
      </Layout>
    </>
  </ChakraProvider>
  );
}

export default App;
