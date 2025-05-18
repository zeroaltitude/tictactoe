class boardTree {
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
        temp.push(new boardTree(this,depth-1,child2,child1))
      }
      this.children.push(temp)
    }
  }
}

player1='X'
player2='O'
const dimension=3
currentPlayer=player1

winconditions = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 1], [2, 2]]]
function checkWin(toCheck) {
  for (i=0; i<winconditions.length; i++) {
    if (toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]]==toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]]&&toCheck.children[winconditions[i][1][0]][winconditions[i][1][1]]==toCheck.children[winconditions[i][2][0]][winconditions[i][2][1]]&&toCheck.children[winconditions[i][0][0]][winconditions[i][0][1]]!=" ") {
      return true;
    }
  }
  return false;
}

var board=new boardTree(null,dimension,-1,-1)
currentBoard=board

while (true) {
  while (typeof currentBoard.children=="object") {
    input=prompt(`${currentPlayer} move: `)
    currentBoard=currentBoard.children[input[0]][input[1]]
  }
  currentBoard=currentBoard.parent
  currentBoard.children[input[0]][input[1]]=currentPlayer

  coords=[currentBoard.row,currentBoard.column,input[0],input[1]]
  alert(coords)
  while (checkWin(currentBoard)) {
    alert(`${currentPlayer} won!`)
    currentBoard=currentBoard.parent
    currentBoard.children[coords[0]][coords[1]]=currentPlayer
    coords.concat([[currentBoard.row,currentBoard.column]])
  }
  for (index=0;index<coords.length;index-=2) {
    if (typeof currentBoard.children=="object") {
      prior=coords.slice(coords.length-2)
      alert(coords)
      currentBoard=currentBoard.parent
      currentBoard=currentBoard.children[prior[0]][prior[1]]
    }
    else {
      input=prompt(`${currentPlayer} move: `)
      currentBoard=currentBoard.children[input[0],input[1]]
    }
    coords=coords.slice(0,prior)
  }
  if (currentPlayer==player1) {
    currentPlayer=player2;
  }
  else {
    currentPlayer=player1;
  }
}
