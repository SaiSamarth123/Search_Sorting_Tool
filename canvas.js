const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    const grid = new Array(gridWidth).fill(null).map(() => new Array(gridHeight).fill(0));
    let mode = 'start';
    let startPoint = null;
    let endPoint = null;

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#000';
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          if (grid[x][y] === 1) {
            ctx.fillStyle = 'black';
          } else if (grid[x][y] === 2) {
            ctx.fillStyle = 'green';
          } else if (grid[x][y] === 3) {
            ctx.fillStyle = 'red';
          } else if (grid[x][y] === 4) {
            ctx.fillStyle = 'blue';
          } else if (grid[x][y] === 5) {
            ctx.fillStyle = 'yellow';
          } else {
            ctx.fillStyle = 'white';
          }
          ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
          ctx.strokeRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
        }
      }
    }

    async function dfs(x, y) {
          if (!isValid(x, y) || grid[x][y] === 1 || grid[x][y] === 4 || grid[x][y] === 5) {
    return false;
  }
  if (x === endPoint.x && y === endPoint.y) {
    return true;
  }
  grid[x][y] = 5;
  drawGrid();
  const speed = document.getElementById('speed').value;
  const delay = speed === 'fast' ? 50 : speed === 'medium' ? 200 : 500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (
    (await dfs(x + 1, y)) ||
    (await dfs(x - 1, y)) ||
    (await dfs(x, y + 1)) ||
    (await dfs(x, y - 1))
  ) {
    grid[x][y] = 4;
    drawGrid();
    return true;
  }
  grid[x][y] = 0;
  drawGrid();
  return false;
}

function isValid(x, y) {
  return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
}

function setStart(x, y) {
  if (startPoint) {
    grid[startPoint.x][startPoint.y] = 0;
  }
  grid[x][y] = 2;
  startPoint = { x, y };
}

function setEnd(x, y) {
  if (endPoint) {
    grid[endPoint.x][endPoint.y] = 0;
  }
  grid[x][y] = 3;
  endPoint = { x, y };
}

function setWall(x, y) {
  if (grid[x][y] === 0) {
    grid[x][y] = 1;
  } else if (grid[x][y] === 1) {
    grid[x][y] = 0;
  }
}

function generateRandomMaze() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (Math.random() > 0.7) {
        setWall(x, y);
      } else {
        grid[x][y] = 0;
      }
    }
  }
  if (startPoint) {
    setStart(startPoint.x, startPoint.y);
  }
  if (endPoint) {
    setEnd(endPoint.x, endPoint.y);
  }
}

function handleMazeChange() {
  const mazeSelect = document.getElementById('maze');
  const selectedMaze = mazeSelect.value;
  if (selectedMaze === 'random') {
    generateRandomMaze();
  } else if (selectedMaze === 'blank') {
    grid.fill(0);
  }
  drawGrid();
}

function clearBoard() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      grid[x][y] = 0;
    }
  }
  if (startPoint) {
    setStart(startPoint.x, startPoint.y);
  }
  if (endPoint) {
    setEnd(endPoint.x, endPoint.y);
  }
  drawGrid();
}

function clearWalls() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (grid[x][y] === 1) {
        grid[x][y] = 0;
    }
}
}
drawGrid();
}

function clearPath() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (grid[x][y] === 4 || grid[x][y] === 5) {
        grid[x][y] = 0;
      }
    }
  }
  drawGrid();
}

document.getElementById('start').addEventListener('click', () => {
  mode = 'start';
});

document.getElementById('end').addEventListener('click', () => {
  mode = 'end';
});

document.getElementById('wall').addEventListener('click', () => {
  mode = 'wall';
});

document.getElementById('run').addEventListener('click', () => {
  if (startPoint && endPoint) {
    dfs(startPoint.x, startPoint.y);
  }
});

document.getElementById('clear').addEventListener('click', clearBoard);
document.getElementById('clear-walls').addEventListener('click', clearWalls);
document.getElementById('clear-path').addEventListener('click', clearPath);

document.getElementById('maze').addEventListener('change', handleMazeChange);

canvas.addEventListener('click', (e) => {
  const x = Math.floor((e.clientX - canvas.getBoundingClientRect().left) / gridSize);
  const y = Math.floor((e.clientY - canvas.getBoundingClientRect().top) / gridSize);
  if (mode === 'start') {
    setStart(x, y);
  } else if (mode === 'end') {
    setEnd(x, y);
  } else if (mode === 'wall') {
    setWall(x, y);
  }
  drawGrid();
});

drawGrid();

