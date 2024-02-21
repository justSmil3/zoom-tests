import logo from './logo.svg';
import './App.css';
import CanvasDraw from './CanvasDraw';

function App() {
  return (
    <div className="App">
      <CanvasDraw _canvasTypes={["mask", "marker", "selection"]} canvasSize={512} splitSpace={2}/>
    </div>
  );
}

export default App;
