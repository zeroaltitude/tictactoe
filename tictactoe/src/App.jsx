import './App.css';
import Board from './Board';
import Moves, { Premover } from './Moves';
import React, { useCallback, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import _ from "lodash";

const NS_DEBUG_NAMES = {
    "MOVE_RECORDER": true,
    "MOVE_CLICK": false,
    "MOVER_DEBUG": false,
    "SPEC_COMPARE": true,
};

export const debugLog = (namespace, message) => {
    if (NS_DEBUG_NAMES[namespace]) {
        console.log(`[${namespace}] ${message}`);
    }
};

// the same as calculateShift
const targetBoardSpec = (previousMove, depth) => {
  // strategy: get the full route to the move; it's an array of size depth * 2
  // e.g. [0, 0, 1, 1, 2, 2]
  const route = previousMove[0].getFullRoute([previousMove[1], previousMove[2]]);
  // then, we split this into two arrays: arr1 of size (depth - 1) * 2, and arr2 of size 2
  // e.g. [0, 0, 1, 1], [2, 2]
  let headArr = route.slice(0, 2 * (depth - 1));
  const tailArr = route.slice(2 * (depth - 1));
  // we keep the first (depth - 2) * 2 items from the first array starting at windepth * 2; the first array
  // represents a path that is now shorter because it will be the prefix for a route pointing to a new board at the
  // position where the last path pointed at a potentially different board
  // e.g. [0, 0], [2, 2] (windepth 1)
  // e.g. [1, 1], [2, 2] (windepth 2)
  // e.g. [1, 1], [2, 2] (windepth 3) -- hit the ceiling, just unshifted one pair from the existing headarray to make
  // room for the tail array
  if (previousMove[3] * 2 >= headArr.length) {
    headArr.shift();
    headArr.shift();
  }
  else {
    headArr = headArr.slice(previousMove[3] * 2, previousMove[3] * 2 + 2 * (depth - 2));
  }
  // now, we append the tail array to the head array
  headArr = headArr.concat(tailArr);
  // we now have a path that's shorter than the default path; since we'll be using parentTreeNode.getNodeByCoordRoute
  // instead of rootNode.getNodeByCoordRoute, our array will now be the right length
  // validate that headArr is of length (depth - 1) * 2
  if (headArr.length !== 2 * (depth - 1)) {
    alert("Target boards length mismatch: expected " + (2 * (depth - 1)) + ", got " + headArr.length);
  }
  // if this board spec COLLIDES with a won board, we take each won board and replace it with *, *
  // let proposedBoardSpec = this.rootNode.getNodeByCoordRoute(headArr);
  return headArr;
};

// the same as targetBoardSpec
const calculateShift = (previousMove) => {
  //[0, 0, 0, 0, 2, 2]                          | [0, 0, 1, 1, 2, 2]
  const route = previousMove[0].getFullRoute([previousMove[1], previousMove[2]]);
  const winDepth = previousMove[3];
  const length = route.length;
  // WINDEPTH 0 pre=[0, 0] route=[0, 0, 2, 2]   | [0, 0], [1, 1, 2, 2]
  // WINDEPTH 1 pre=[] route=[0, 0, 0, 0, 2, 2] | [], [0, 0, 1, 1, 2, 2]
  // WINDEPTH 2 pre=[] route=[0, 0, 0, 0, 2, 2] | [], [0, 0, 1, 1, 2, 2]
  // WINDEPTH 3 pre=[] route=[0, 0, 0, 0, 2, 2] | [], [0, 0, 1, 1, 2, 2]
  const pre = route.splice(0, length - 2 * (winDepth + 2));
  // WINDEPTH 0 suf=[2, 2] route=[0, 0]         | [2, 2], [1, 1]
  // WINDEPTH 1 suf=[0, 0, 2, 2] route=[0, 0]   | [1, 1, 2, 2], [0, 0]
  // WINDEPTH 2 suf=[0, 0, 2, 2] route=[0, 0]   | [1, 1, 2, 2], [0, 0]
  // WINDEPTH 3 suf=[0, 0, 2, 2] route=[0, 0]   | [1, 1, 2, 2], [0, 0]
  const suf = route.splice(2);
  // WINDEPTH 0 [0, 0, 2, 2]                    | [0, 0, 1, 1, 2, 2]
  // WINDEPTH 1 [0, 0, 2, 2]                    | [1, 1, 2, 2]
  // WINDEPTH 2 [0, 0, 2, 2]                    | [1, 1, 2, 2]
  // WINDEPTH 3 [0, 0, 2, 2]                    | [1, 1, 2, 2]
  return pre.concat(suf);
};

const pathMatches = (templateSupportingPath, path) => {
  for (let i = 0; i < templateSupportingPath.length; i++) {
    if (templateSupportingPath[i] !== '*' && templateSupportingPath[i] !== path[i]) {
      return false;
    }
  }
  return true;
};

class BoardTree {
  constructor(root, parent, depth, row, column) {
    this.parent = parent;
    this.depth = depth;
    this.row = row;
    this.column = column;
    this.wonBy = '';
    this.children = [];
    this.rootNode = root === null ? this : root;
    if (depth === 0) {
      return;
    }
    for (let child1 = 0; child1 < 3; child1++) {
      let temp= [];
      for (let child2 = 0; child2 < 3; child2++) {
        temp.push(new BoardTree(this.rootNode, this, depth - 1, child1, child2))
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
    // 'this' is starting board for coordinate transformation
    let start = this;
    for (let pair = 0; pair < coordRoute.length; pair += 2) {
      start = start.children[coordRoute[pair]][coordRoute[pair + 1]];
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

  hasSameParentAs(treeNode) {
    return this.parent === treeNode.parent;
  }

  activeCheck(previousMove) {
    // playing on a won board is not allowed; this is therefore not active
    if (this.isAnyParentWon()) {
      return false;
    }
    // on the first move, all boards are active
    if (previousMove.length === 0 || this.parent == null) {
      return true;
    }
    // where the next player should go based on prior move given that that board is not yet won
    let boardSpec = targetBoardSpec(previousMove, this.rootNode.depth);
    const shiftedRoute = calculateShift(previousMove);
    // debugLog("SPEC_COMPARE", `targetBoardSpec: ${boardSpec}, shiftedRoute: ${shiftedRoute}`);
    // debugLog("SPEC_COMPARE", `compare: ${_.isEqual(boardSpec, shiftedRoute)}`);
    // debugLog("SPEC_COMPARE", `match: ${_.isEqual(this.getFullRoute([]), shiftedRoute)}`);
    // debugLog("SPEC_COMPARE", `match: ${_.isEqual(this.getFullRoute([]), boardSpec)}`);
    // debugLog("SPEC_COMPARE", `match: ${pathMatches(this.getFullRoute([]), boardSpec)}`);
    // is the current board the one that the next player should play on?
    if (_.isEqual(this.getFullRoute([]), shiftedRoute)) {
        // if the current board is the one that the next player should play on, then it is active
        return true;
    }
    // did the prior move map to a board that is won?
    let shiftedRouteBoard = this.rootNode.getNodeByCoordRoute(shiftedRoute);


    // now, we could have failed the prior check because the route mapped to a won board; account for this
    let shiftedRouteBoard = this.rootNode.getNodeByCoordRoute(shiftedRoute);
    let tempThis = this;
    while (shiftedRouteBoard !== null && tempThis !== null) {
      if (shiftedRouteBoard.wonBy !== '' && tempThis.hasSameParentAs(shiftedRouteBoard)) {
        // now limit the boards to those whose children are won at the relevant coordinate OR are not won but match
        // the previous move coordinate
        return true;
      }
      shiftedRouteBoard = shiftedRouteBoard.parent;
      tempThis = tempThis.parent;
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

export default function App() {
  //'treeNode' is the board at which the click event happens
  const dimension = 3;
  const [moveList, setMoveList] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [boardTree, setBoardTree] = useState(new BoardTree(null, null, dimension, 0,  0));
  const [previousMove, setPreviousMove] = useState([]);
  const [winDepth, setWinDepth] = useState(0);

  const notify = (message) => toast(message);

  const handleMove = useCallback((event, treeNode, row, column) => {
    /* treeNode is always the parent board of the move played, not the move itself */
    if (!treeNode.activeCheck(previousMove)) {
      notify(`brotjer look at the previous move, do you even know the rulse: [${event.target.id}]`);
      return;
    }
    // Create a new boardTree reference to ensure React detects the state change
    const newBoardTree = _.cloneDeep(boardTree);
    // Find the corresponding node in the new boardTree
    const newTreeNode = newBoardTree.getNodeByCoordRoute(treeNode.getFullRoute([]));
    newTreeNode.children[row][column].wonBy = currentPlayer;
    setMoveList(moveList.concat([newTreeNode.getFullRoute([row,column])]));
    event.target.innerHTML = currentPlayer;
    let currentBoard = newTreeNode;
    let winDepth= 0;
    while (checkWin(currentBoard)) {
      notify(`${currentPlayer} won!`);
      currentBoard.wonBy = currentPlayer;
      winDepth++;
      currentBoard = currentBoard.parent;
    }
    setWinDepth(winDepth);
    setPreviousMove([newTreeNode,row,column,winDepth]);
    setBoardTree(newBoardTree);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  },[currentPlayer, boardTree, previousMove, moveList]);

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
        <Premover handleMove={handleMove} currentPlayer={currentPlayer} />
        <Board
            depth={dimension}
            row={0} column={0}
            handleMove={handleMove}
            treeNode={boardTree}
            winDepth={winDepth}
            previousMove={previousMove}
            dimension={dimension}
        />
        <ToastContainer />
      </div>
    </div>
  );
}
