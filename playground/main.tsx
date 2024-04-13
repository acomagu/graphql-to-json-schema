import { MantineProvider } from '@mantine/core';
import * as React from 'react';
import { createRoot } from "react-dom/client";
import { App } from './App.js';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme='auto'>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
