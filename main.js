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
        temp.push(new boardTree(this,depth-1,child1,child2))
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

/*currentBoard.children[0][0].children[1][1]="X"
currentBoard.children[0][0].children[2][2]="X"
currentBoard.children[1][1].children[0][0].children[1][1]="X"
currentBoard.children[1][1].children[0][0].children[2][2]="X"
currentBoard.children[0][0].children[0][0].children[1][1]="X"
currentBoard.children[0][0].children[0][0].children[2][2]="X"
/*currentBoard.children[0][0].children[0][0].children[1][1]="X"
currentBoard.children[0][0].children[0][0].children[2][2]="X"*/

while (true) {
  while (typeof currentBoard.children=="object") {
    while (true) {
      input=prompt(`${currentPlayer} move: `)
      try {
        currentBoard.children[input[0]][input[1]].children[0][0]
        break
      }
      catch {
        alert("you cant go there g")
      }
    }
    currentBoard=currentBoard.children[input[0]][input[1]]
  }
  currentBoard=currentBoard.parent
  currentBoard.children[input[0]][input[1]]=currentPlayer
  windepth=0
  coords=[]
  while (checkWin(currentBoard)) {
    alert(windepth)
    alert(`${currentPlayer} won!`)
    coords=coords.concat([currentBoard.row,currentBoard.column])
    currentBoard=currentBoard.parent
    currentBoard.children[coords[0]][coords[1]]=currentPlayer
    windepth++
  }
  if (currentPlayer==player1) {
    currentPlayer=player2;
  }
  else {
    currentPlayer=player1;
  }
  route=currentBoard.getFullRoute(coords.concat([input[0],input[1]]))
  currentBoard=board
  route=route.slice(0,route.length-2*(windepth+2)).concat(route.slice(route.length-2*(windepth+1)))
  if (route.length>2*(dimension-1)) {
    //that might be bad ^
    //what in the world am i doing
    //route=route.slice(0,route.length-(2*(windepth+1))).slice(0,route.slice(0,route.length-(2*(windepth+1))).length-(route.length-(2*(dimension-1)))).concat(route.slice(route.length-(2*(windepth+1))))
    route=route.slice(0,2*(dimension-1))
  }
  alert(route)
  for (index=0;index<route.length;index+=2) {
    alert(`${currentBoard.depth}, ${currentBoard.row}, ${currentBoard.column}`)
    if (typeof currentBoard.children[route[index]][route[index+1]]!="object") {
      alert(currentBoard.children[route[index]][route[index+1]])
      alert("we in dis hoe")
      while (true) {
        input=prompt(`weird ${currentPlayer} move: `)
        try {
          currentBoard.children[0][0]
          break
        }
        catch {
          alert("you cant go there man")
        }
      }
      route[index]=input[0]
      route[index+1]=input[1]
    }
    currentBoard=currentBoard.children[route[index]][route[index+1]]
  }
}
