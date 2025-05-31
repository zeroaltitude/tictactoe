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
    "SPEC_COMPARE": false,
    "ERROR": true,
};

export const debugLog = (namespace, message) => {
    if (NS_DEBUG_NAMES[namespace]) {
        console.log(`[${namespace}] ${message}`);
    }
};

const targetBoardSpec = (previousMove, depth) => {
  // algorithm: poke out one position at the full route to the previous move at arrlen - (2 * (windepth + 1))
  const route = previousMove[0].getFullRoute([previousMove[1], previousMove[2]]);
  const splitIndex = route.length - (2 * (previousMove[3] + 2));
  // on overflow negative, rectify to top board positions 0 through 2
  return route.slice(0, splitIndex < 0 ? 0 : splitIndex).concat(route.slice(splitIndex < 0 ? 2 : splitIndex + 2));
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
    // if the current board is the one that the next player should play on, then it is active
    if (_.isEqual(this.getFullRoute([]), boardSpec)) {
      return true;
    }
    // did the prior move map to a board that is won?
    let shiftedRouteBoard = this.rootNode.getNodeByCoordRoute(boardSpec);
    // in this case, the next board up is won, so if we have the same parent as the won board, we are active
    if (shiftedRouteBoard.wonBy !== '' && this.hasSameParentAs(shiftedRouteBoard)) {
      return true;
    }
    while (shiftedRouteBoard.parent != null) {
      shiftedRouteBoard = shiftedRouteBoard.parent;
      if (shiftedRouteBoard.wonBy !== '') {
        // in this case, the next two boards up are won, so we use the match pattern to see if we (a) match the coord
        // of the shifted route or (b) the board of our sibling that DOES match the shifted route is won
        const boardIndex = boardSpec.length - shiftedRouteBoard.depth * 2;
        if (boardSpec[boardIndex] === this.row && boardSpec[boardIndex + 1] === this.column) {
          // we match the coordinate of the shifted route, so we are active
          return true;
        } else {
          const localTargetBoard = this.parent.children[boardSpec[boardIndex]][boardSpec[boardIndex + 1]];
          // the sibling board that matches the shifted route is won, so we are active
          if (localTargetBoard.wonBy !== '') {
            return true;
          }
        }
      }
    }
    // bail
    return false;
  }
}

function checkWin(toCheck) {
  const winconditions = [
       [[0, 0], [0, 1], [0, 2]],
       [[1, 0], [1, 1], [1, 2]],
       [[2, 0], [2, 1], [2, 2]],
       [[0, 0], [1, 0], [2, 0]],
       [[0, 1], [1, 1], [2, 1]],
       [[0, 2], [1, 2], [2, 2]],
       [[0, 2], [1, 1], [2, 0]],
       [[0, 0], [1, 1], [2, 2]]
  ]
  for (let i=0; i<winconditions.length; i++) {
    if (toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]].wonBy ===
        toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy &&
        toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]].wonBy ===
        toCheck.children[winconditions[i][2][0]][winconditions[i][2][1]].wonBy &&
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
