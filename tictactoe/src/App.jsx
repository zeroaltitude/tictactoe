import './App.css';
import Board from './Board';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";

class BoardTree {
  constructor(parent,depth,row,column) {
    this.parent=parent
    this.depth=depth
    this.row=row
    this.column=column
    this.children=0
    if (depth==0) {
      return 0
    }
    this.children=[]
    for (var child1=0;child1<3;child1++) {
      var temp=[]
      for (var child2=0;child2<3;child2++) {
        temp.push(new BoardTree(this,depth-1,child1,child2))
      }
      this.children.push(temp)
    }
  }
  getFullRoute(move) {
    var route=move
    var current=this
    while (current.parent!=null) {
      route=[current.row,current.column].concat(route)
      current=current.parent
    }
    return route
  }
}

function checkWin(toCheck) {
  const winconditions = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 1], [2, 2]]]
  for (let i=0; i<winconditions.length; i++) {
    if (toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]]==toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]]&&toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]]==toCheck.children[winconditions[i][2][0]][winconditions[i][2][1]]&&toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]]!=" ") {
      return true;
    }
  }
  return false;
}

function calculateShift(previousMove) {
  const route=previousMove[0].getFullRoute([previousMove[1],previousMove[2]])
  const windepth=previousMove[3];
  const suffix=route.slice((windepth+2)*2);
  const prefix=route.slice(0,(windepth+1)*2);
  return prefix.concat(suffix);
}

function playingOnCorrectBoard(previousMove, treeNode, row, column) {
  if (previousMove.length==0) {
    return true;
  }
  const route=calculateShift(previousMove);
  const currentRoute=treeNode.getFullRoute([row,column]);
  console.log(route,currentRoute.slice(0,currentRoute.length-2));
  if (_.isEqual(currentRoute.slice(0,currentRoute.length-2*(previousMove[3]+1)),route)) {
    return true;
  }
  return false;
  //[2,2,1,1,2,1]
  //windepth=0
  //[_,_,2,2,2,1]
  //windepth=1
  //[_,_,2,2,1,1]
  // step 1
  // grab (windepth+1)*2 leading elements as A
  // windepth=0 [2, 2]
  // windepth=1 [2, 2, 1, 1]
  // grab the last route_len - (windepth + 2) * 2
  // windepth=0 [2, 1]
  // windepth=1 []
  // jam those together
  // windepth=0 [2, 2, 2, 1]
  // windepth=1 [2, 2, 1, 1]
}

export default function App() {
  const dimension=3;
  const players=['X','O'];
  const [currentPlayer, setCurrentPlayer] = useState(players[0]);
  const [boardTree, setBoardTree] = useState(new BoardTree(null,dimension,0,0));
  const [previousMove, setPreviousMove] = useState([]);
  const [activeBoard, setActiveBoard] = useState([]);
  const [winDepth, setWinDepth] = useState(0);

  const handleMove = useCallback((event,treeNode,row,column) => {
    let winDepth=0;
    if (typeof(treeNode.children[row][column])!="object") {
      alert("brotjer its takenm do you have eyeys");
      return
    }
    if (!playingOnCorrectBoard(previousMove,treeNode,row,column)) {
      alert("brotjer look at the previous move, do you even know the rulse");
      return
    }
    treeNode.children[row][column]=currentPlayer;
    event.target.innerHTML=currentPlayer;
    setCurrentPlayer(players[(players.indexOf(currentPlayer)+1)%2]);
    setPreviousMove([treeNode,row,column,winDepth]);
    setActiveBoard(calculateShift([treeNode,row,column,winDepth]));
    setWinDepth(winDepth);
  },[currentPlayer, boardTree, previousMove]);

  return (
    <div className="App">
      <div style={{
            backgroundColor: "#ddd"
        }}>
        <h1>
          Player {currentPlayer} turn
        </h1>
      </div>
      <Board depth={dimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} activeBoard={activeBoard} winDepth={winDepth} />
    </div>
  );
}

