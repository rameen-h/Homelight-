import React from 'react';
import './App.css';
import HomePage from './components/Homepage/pages';
import useAnalytics from './hooks/useAnalytics';

function App() {
  // Send initial page view when app loads
  useAnalytics();

  return <HomePage />;
}

export default App;
