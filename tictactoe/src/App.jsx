import './App.css';
import Board from './Board';
import Moves, { Premover } from './Moves';
import React, { useCallback, useMemo, useState } from "react";
import _ from "lodash";

const NS_DEBUG_NAMES = {
    "MOVE_RECORDER": true,
    "MOVE_CLICK": false,
};
export const debugLog = (namespace, message) => {
    if (NS_DEBUG_NAMES[namespace]) {
        console.log(`[${namespace}] ${message}`);
    }
};

class BoardTree {
  constructor(root, parent, depth, row, column) {
    this.parent = parent;
    this.depth = depth;
    this.row = row;
    this.column = column;
    this.children = 0;
    this.wonBy = '';
    this.rootNode = root === null ? this : root;
    if (depth === 0) {
      return 0;
    }
    this.children = [];
    for (let child1=0;child1<3;child1++) {
      let temp= [];
      for (let child2=0;child2<3;child2++) {
        temp.push(new BoardTree(this.rootNode, this, depth-1, child1, child2))
      }
      this.children.push(temp)
    }
  }

  getFullRoute(move) {
    let route = move;
    let current = this;
    while (current.parent != null) {
      route = [current.row,current.column].concat(route);
      current = current.parent;
    }
    return route
  }

  getNodeByCoordRoute(coordRoute) {
    //'this' is starting board for coordinate transformation
    let start = this;
    for (let pair=0;pair<coordRoute.length;pair+=2) {
      start=start.children[coordRoute[pair]][coordRoute[pair+1]];
    }
    return start;
  }

  isAnyParentWon() {
    if (this.wonBy !== '') {
      return true;
    }
    else if (this.parent == null) {
      return false;
    }
    else {
      return this.parent.isAnyParentWon();
    }
  }
  setAllChildren(toSet) {
    this.children.map((row)=>{row.map((child)=>{
      if (this.depth>1) {
        child.setAllChildren(toSet);
      }
      child.isActive=toSet;
    })})
  }
  setActiveStatus(shiftedRoute) {
    //third time's the charm
    if (shiftedRoute.length==0) {
      this.isActive=true;
      this.setAllChildren(true);
      return;
    }
    console.log('og')
    console.log(shiftedRoute)
    const unusedCoords=shiftedRoute.splice(2);
    if (this.row!=shiftedRoute[0] || this.column!=shiftedRoute[1]) {
      console.log(this.depth)
      console.log(this)
      console.log(shiftedRoute)
      console.log(unusedCoords)
      this.isActive=false;
      this.setAllChildren(false)
    }
    if (this.wonBy!='') {
      this.parent.children.map((row)=>{row.map((child)=>{
        child.setActiveStatus(unusedCoords);
      })})
    }
    else if (this.depth==1) {
      this.isActive=true;
    }
    else {
      this.children[shiftedRoute[0]][shiftedRoute[1]].setActiveStatus(unusedCoords);
    }
    // bail
    return false;
  }
}

function checkWin(toCheck) {
  const winconditions = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 1], [2, 2]]]
  for (let i=0; i<winconditions.length; i++) {
    if (toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy === toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy &&
        toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy === toCheck.children[winconditions[i][2][0]][winconditions[i][2][1]].wonBy &&
        toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy !== "") {
      return true;
    }
  }
  return false;
}

function calculateShift(previousMove) {
  if (previousMove.length==0) {
    return []
  }
  const route=previousMove[0].getFullRoute([previousMove[1],previousMove[2]]);
  const winDepth=previousMove[3];
  const length=route.length;
  const pre=route.splice(0,length-2*(winDepth+2));
  const suf=route.splice(2);
  return pre.concat(suf);
}

export default function App() {
  //'treeNode' is the board at which the click event happens
  const dimension=3;
  const players = useMemo(() => ['X','O'], []);
  const [moveList, setMoveList] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(players[0]);
  const [boardTree, setBoardTree] = useState(new BoardTree(null, null, dimension, 0,  0));
  const [previousMove, setPreviousMove] = useState([]);
  const [winDepth, setWinDepth] = useState(0);

  const handleMove = useCallback((event,treeNode,row,column) => {
    boardTree.setActiveStatus(calculateShift(previousMove))
    console.log(boardTree)
    //treeNode is always the parent board of the move played, not the move itself
    let winDepth=0;
    if (treeNode.children[row][column].wonBy!='') {
      alert("brotjer its takenm do you have eyeys");
      return
    }
    if (!treeNode.isActive) {
      alert("brotjer look at the previous move, do you even know the rulse");
      return
    }
    treeNode.children[row][column].wonBy = currentPlayer;
    setMoveList(moveList.concat([treeNode.getFullRoute([row,column])]));
    event.target.innerHTML = currentPlayer;
    let currentBoard = treeNode;
    let winDepth= 0;
    while (checkWin(currentBoard)) {
      alert(`${currentPlayer} won!`);
      currentBoard.wonBy = currentPlayer;
      winDepth++;
      currentBoard = currentBoard.parent;
    }
    setWinDepth(winDepth);
    setCurrentPlayer(players[(players.indexOf(currentPlayer)+1)%2]);
    setPreviousMove([treeNode,row,column,winDepth]);
    setBoardTree(boardTree)
  },[currentPlayer, boardTree, previousMove, players, moveList]);

  return (
    <div className="App">
      <div style={{
            backgroundColor: "#ddd"
        }}>
        <h1>
          Player {currentPlayer} turn
        </h1>
      </div>
      <div style={{
        display:"flex"
      }}>
        <Moves moveList={moveList} />
        <Premover handleMove={handleMove} boardTree={boardTree} />
        <Board depth={dimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} winDepth={winDepth} previousMove={previousMove} dimension={dimension} />
      </div>
    </div>
  );
}
