import React from 'react';
import Main from './components/Main.jsx';
import useDragScroll from './components/useDragScroll';

function App() {
  useDragScroll();

  return (
    <div className="App">
      <Main />
    </div>
  );
}

export default App;
