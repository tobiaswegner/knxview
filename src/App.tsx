import React from 'react';
import './App.css';
import { TelegramViewer } from './components/TelegramViewer';

const App: React.FC = () => {
  return (
    <div className="App">
      <TelegramViewer />
    </div>
  );
};

export default App;