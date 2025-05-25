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
    console.log(this)
    if (previousMove.length==0 || this.parent==null) {
      this.isActive=true;
      return true;
    }
    if (this.wonBy!='') {
      console.log("failed won check:")
      console.log(this)
      this.isActive=false;
      return false;
    }
    console.log("running parent check:")
    console.log(this.parent)
    if (!this.parent.activeCheck(previousMove)) {
      console.log("failed parent check:")
      console.log(this)
      this.isActive=false;
      return false;
    }
    //(where the next player should go based on prior move)
    const shiftedRoute=calculateShift(previousMove);
    let baseBoard=this;
    while (baseBoard.parent!=null) {
      baseBoard=baseBoard.parent;
    }
    //baseBoard is top layer board
    console.log("shifted check:")
    if (this.row==shiftedRoute[shiftedRoute.length-((this.depth)*2)] && this.column==shiftedRoute[shiftedRoute.length-(((this.depth)*2))+1]) {
      this.isActive=true;
      return true;
    }
    //boardPlayerIsSentTo, and subsequently boardCheck, should be depth 1
    console.log("taken check:")
    const boardPlayerIsSentTo=baseBoard.navigateTo(shiftedRoute);
    console.log("shifted route:")
    console.log(shiftedRoute)
    let boardCheck=boardPlayerIsSentTo;
    let highestBoardCheckParent=boardCheck.parent;
    let highestThisParent=this.parent;
    console.log("boardcheck, this:")
    console.log(boardCheck)
    console.log(this)
    console.log("parents before maniputlation:")
    console.log(highestBoardCheckParent)
    console.log(highestThisParent)
    while (highestBoardCheckParent.wonBy!='') {
      highestBoardCheckParent=highestBoardCheckParent.parent;
      if (highestThisParent.depth<=highestThisParent) {
        highestThisParent=highestThisParent.parent;
      }
    }
    console.log("highest parent check and highest this parent")
    console.log(highestBoardCheckParent)
    console.log(highestThisParent)
    console.log("boardchekc and conditions:")
    console.log(boardCheck)
    console.log(boardCheck.isAnyParentWon())
    console.log(highestBoardCheckParent==highestThisParent)
    if (boardCheck.isAnyParentWon() && highestBoardCheckParent==highestThisParent) {
      console.log("works")
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

function playingOnCorrectBoard(previousMove,treeNode,row,column,boardTree) {
  if (previousMove.length==0) {
    return true;
  }
  const route=calculateShift(previousMove);
  const unshiftedRoute=previousMove[0].getFullRoute([previousMove[1],previousMove[2]])
  const currentRoute=treeNode.getFullRoute([row,column]);
  const currentShifted=currentRoute.slice(0,currentRoute.length-2);
  let finalShifted=currentShifted;
  let currentBoard=boardTree;
  let finalRoute=route;
  console.log(currentRoute+"b")
  for (let boardIndex=0;boardIndex<currentRoute.length;boardIndex+=2) {
    console.log(currentBoard)
    console.log(typeof(currentBoard.children[unshiftedRoute[boardIndex]][unshiftedRoute[boardIndex+1]]), currentBoard.children[unshiftedRoute[boardIndex]][unshiftedRoute[boardIndex+1]].wonBy+boardIndex)
    if (typeof(currentBoard.children[unshiftedRoute[boardIndex]][unshiftedRoute[boardIndex+1]])!="object" || currentBoard.children[unshiftedRoute[boardIndex]][unshiftedRoute[boardIndex+1]].wonBy!='') {
      console.log('i ran'+boardIndex)
      let temp=finalShifted.splice(0,boardIndex);
      let temp2=finalRoute.splice(0,boardIndex);
      temp=temp.concat([9,9]);
      temp2=temp2.concat([9,9]);
      finalShifted=temp.concat(finalShifted.splice(2));
      finalRoute=temp2.concat(finalRoute.splice(2));
    }
    currentBoard=currentBoard.children[unshiftedRoute[boardIndex]][unshiftedRoute[boardIndex+1]];
  }
  console.log(finalShifted,finalRoute);
  if (_.isEqual(finalShifted,finalRoute)) {
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
  //'treeNode' is the board at which the click event happens
  const dimension=3;
  const players=['X','O'];
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
      console.log('this is the boardtree:')
      console.log(boardTree);
      alert("brotjer look at the previous move, do you even know the rulse");
      return
    }
    treeNode.children[row][column].wonBy=currentPlayer;
    event.target.innerHTML=currentPlayer;

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
  },[currentPlayer, boardTree, previousMove, players]);

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

