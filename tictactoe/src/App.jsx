import './App.css';
import Board from './Board';

export default function App() {
  return (
    <div className="App">
      <Board depth={3} row={0} column={0}/>
    </div>
  );
}

