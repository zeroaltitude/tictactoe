boardlegacy = [
  [' ', ' ', ' '],
  [' ', ' ', ' '],
  [' ', ' ', ' ']
]

row=[' ', ' ', ' ']
function makeboard(dimension) {
  if (dimension==0) {
    return ' ';
  }
  else {
    return [[makeboard(dimension-1),makeboard(dimension-1),makeboard(dimension-1)],
           [makeboard(dimension-1),makeboard(dimension-1),makeboard(dimension-1)],
           [makeboard(dimension-1),makeboard(dimension-1),makeboard(dimension-1)]];
  }
}

d=Number(prompt("what dimenrtion"))

curboard=makeboard(d)
console.log(curboard)

player1 = "X"
player2 = "O"
currentPlayer=player1
depth=0
boardStack=[]
expectedArgs=2*d
outerindex=0

winconditions = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 2], [1, 1], [2, 0]], [[0, 0], [1, 1], [2, 2]]];

function checkWin(toCheck) {
  for (i=0; i<winconditions.length; i++) {
    if (toCheck[winconditions[i][0][0]][winconditions[i][0][1]]==toCheck[winconditions[i][1][0]][winconditions[i][1][1]]&&toCheck[winconditions[i][1][0]][winconditions[i][1][1]]==toCheck[winconditions[i][2][0]][winconditions[i][2][1]]&&toCheck[winconditions[i][0][0]][winconditions[i][0][1]]!=" ") {
      return true;
    }
  }
  return false;
}
alert(curboard)
// oh god, its alkl wrong, oh my god, help
while (true) {
  input = prompt(`${currentPlayer}:    nmiove? (expected # of args: ${expectedArgs})`);
  while (depth<d-1) {
    boardStack.push(curboard[input[depth]]);
    depth++;
    curboard=curboard[input[depth]]
    console.log(`curent: ${curboard}`);
    console.log(boardStack);
    outerindex=input[input.length-3];
  }
  expectedArgs=2
  curboard[input[0]][input[1]] = currentPlayer;
  alert(curboard)
  if (checkWin(curboard)) {
    alert(`${currentPlayer} wins!`);
    curboard=boardStack.pop()
    curboard[outerindex]=currentPlayer
    depth--;
    
  }
  if (currentPlayer == player1) {
    currentPlayer = player2;
  }
  else {
    currentPlayer = player1;
  }
}
