import './App.css';
import Board from './Board';
import Moves from './Moves';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";

class BoardTree {
  constructor(parent,depth,row,column) {
    this.parent=parent
    this.depth=depth
    this.row=row
    this.column=column
    this.children=0
    this.wonBy=''
    this.isActive=false
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
  navigateTo(coordRoute) {
    //'this' is starting board for coordinate transformation
    let start=this;
    for (let pair=0;pair<coordRoute.length;pair+=2) {
      start=start.children[coordRoute[pair]][coordRoute[pair+1]];
    }
    return start
  }
  isAnyParentWon() {
    if (this.wonBy!='') {
      return true;
    }
    else if (this.parent==null) {
      return false;
    }
    else {
      return this.parent.isAnyParentWon();
    }
  }
  activeCheck(previousMove) {
    if (previousMove.length==0 || this.parent==null) {
      this.isActive=true;
      return true;
    }
    //(where the next player should go based on prior move)
    const shiftedRoute=calculateShift(previousMove);
    let baseBoard=this;
    while (baseBoard.parent!=null) {
      baseBoard=baseBoard.parent;
    }
    if (!this.parent.activeCheck(previousMove)) {
      this.isActive=false;
      return false;
    }
    //baseBoard is top layer board
    console.log("THIS THING:")
    console.log(this.parent.children[shiftedRoute.length-((this.depth)*2)][shiftedRoute[shiftedRoute.length-(((this.depth)*2))+1]])
    if (((this.row==shiftedRoute[shiftedRoute.length-((this.depth)*2)] && this.column==shiftedRoute[shiftedRoute.length-(((this.depth)*2))+1]) && (
      this.wonBy==''
    )) || (
      this.parent.children[previousMove[1]][previousMove[2]].wonBy!='' && this.wonBy=='' && this.parent.row==shiftedRoute[shiftedRoute.length-((this.depth+1)*2)][shiftedRoute[shiftedRoute.length-(((this.depth+1)*2))+1]]
    )) {
      this.isActive=true;
      return true;
    }
    if (this.wonBy!='') {
      this.isActive=false;
      return false;
    }
    //boardPlayerIsSentTo, and subsequently boardCheck, should be depth 1
    const boardPlayerIsSentTo=baseBoard.navigateTo(shiftedRoute);
    let boardCheck=boardPlayerIsSentTo;
    let highestBoardCheckParent=boardCheck.parent;
    let highestThisParent=this.parent;
    while (highestBoardCheckParent.wonBy!='') {
      console.log(highestBoardCheckParent)
      console.log(highestThisParent)
      highestBoardCheckParent=highestBoardCheckParent.parent;
    }
    if (boardCheck.isAnyParentWon() && highestBoardCheckParent==highestThisParent) {
      this.isActive=true;
      return true;
    }
  }
}

function checkWin(toCheck) {
  const winconditions = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 1], [2, 2]]]
  for (let i=0; i<winconditions.length; i++) {
    if (toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy==toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy&&toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy==toCheck.children[winconditions[i][2][0]][winconditions[i][2][1]].wonBy&&toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy!="") {
      return true;
    }
  }
  return false;
}

function calculateShift(previousMove) {
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

  const players=['X','O'];
  const [moveList, setMoveList] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(players[0]);
  const [boardTree, setBoardTree] = useState(new BoardTree(null,dimension,0,0));
  const [previousMove, setPreviousMove] = useState([]);
  const [activeBoard, setActiveBoard] = useState([]);
  const [winDepth, setWinDepth] = useState(0);

  const handleMove = useCallback((event,treeNode,row,column) => {
    //treeNode is always the parent board of the move played, not the move itself
    let winDepth=0;
    if (treeNode.children[row][column].wonBy!='') {
      alert("brotjer its takenm do you have eyeys");
      return
    }
    if (!treeNode.activeCheck(previousMove)) {
      alert("brotjer look at the previous move, do you even know the rulse");
      return
    }
    treeNode.children[row][column].wonBy=currentPlayer;
    setMoveList(moveList.concat([treeNode.getFullRoute([row,column])]));
    event.target.innerHTML=currentPlayer;
    console.log(moveList);

    let currentBoard=treeNode;
    let coords=[];
    while (checkWin(currentBoard)) {
      alert(`${currentPlayer} won!`);
      coords=[currentBoard.row,currentBoard.column];
      currentBoard=currentBoard.parent;
      //this line has changed according to "new standards":
      currentBoard.children[coords[0]][coords[1]].wonBy=currentPlayer;
      winDepth++;
    }

    setWinDepth(winDepth);
    setCurrentPlayer(players[(players.indexOf(currentPlayer)+1)%2]);
    setPreviousMove([treeNode,row,column,winDepth]);
    setActiveBoard(calculateShift([treeNode,row,column,winDepth]));
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
        <Board depth={dimension} row={0} column={0} handleMove={handleMove} treeNode={boardTree} activeBoard={activeBoard} winDepth={winDepth} previousMove={previousMove} />
      </div>
    </div>
  );
}

