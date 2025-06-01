import './App.css';
import Board from './Board';
import Moves, { Premover } from './Moves';
import React, { useCallback, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import _ from "lodash";

const NS_DEBUG_NAMES = {
    "MOVE_RECORDER": false,
    "MOVE_CLICK": false,
    "MOVER_DEBUG": false,
    "SPEC_COMPARE": false,
    "SHIFT_DEBUG": true,
    "ERROR": true,
};

export const debugLog = (namespace, message, obj = null) => {
    if (NS_DEBUG_NAMES[namespace]) {
        console.log(`[${namespace}] ${message}`, obj);
    }
};

const targetBoardSpec = (previousMove) => {
  // algorithm: poke out one position at the full route to the previous move at arrlen - (2 * (windepth + 1))
  const route = previousMove[0].getFullRoute([previousMove[1], previousMove[2]]);
  // on overflow negative, rectify to 0
  const splitIndex = (route.length - (2 * (previousMove[3] + 2))) < 0 ? 0 : (route.length - (2 * (previousMove[3] + 2)));
  return route.slice(0, splitIndex).concat(route.slice(splitIndex + 2));
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
      return this.depth;
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

  ancestor(depth) {
    let ancestor = this;
    while (depth > 0) {
      if (ancestor.parent != null) {
        ancestor = ancestor.parent;
      }
      depth--;
    }
    return ancestor;
  }

  walkWonParents() {
    let wonNode = this;
    if (wonNode.wonBy === '') {
      return [null, 0];
    }
    let offset = 1;
    while (wonNode.parent != null && wonNode.parent.wonBy !== '') {
      wonNode = wonNode.parent;
      offset++;
    }
    return [wonNode, offset];
  }

  nodeActiveGivenTargetBoard(targetedBoardSpec) {
    // I'm trying to judge my route with the target board's route. So I take my route as the base template. At each
    // level, I ask: "Does my route match the target board's route?" If it does, proceed assuming true. If not, I check
    // whether the board at my layer that DOES match is won; if it is, I proceed assuming true. If it does not, I return
    // false. If I make it to the end, I return true.
    let targetedBoard = this.rootNode.getNodeByCoordRoute(targetedBoardSpec);
    let i = 0;
    do {
      if (targetedBoard.row !== this.ancestor(i).row || targetedBoard.column !== this.ancestor(i).column) {
        // could be ok; have to check if the matching sibling is won
        if (this.ancestor(i).parent.children[targetedBoard.row][targetedBoard.column].wonBy === '') {
          // now we're sure
          return false;
        }
      }
      targetedBoard = targetedBoard.parent;
      i++;
    } while (targetedBoard != null);
    return true;
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
    // where the next player should go based on prior move
    const boardSpec = targetBoardSpec(previousMove);
    if (this.depth === 1) {
      return this.nodeActiveGivenTargetBoard(boardSpec);
    } else {
      return false;
    }
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
