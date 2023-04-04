const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const gridWidth = Math.floor(canvas.width / gridSize);
const gridHeight = Math.floor(canvas.height / gridSize);
const grid = new Array(gridWidth)
  .fill(null)
  .map(() => new Array(gridHeight).fill(0));
let mode = "start";
let startPoint = null;
let endPoint = null;
let isRunning = false;
function drawGrid() {
  const canvasWidth = 800;
  const canvasHeight = 600;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000";
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (grid[x][y] === 1) {
        ctx.fillStyle = "black";
      } else if (grid[x][y] === 2) {
        ctx.fillStyle = "green";
      } else if (grid[x][y] === 3) {
        ctx.fillStyle = "red";
      } else if (grid[x][y] === 4) {
        ctx.fillStyle = "blue";
      } else if (grid[x][y] === 5) {
        ctx.fillStyle = "yellow";
      } else {
        ctx.fillStyle = "white";
      }
      ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
      ctx.strokeRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
    }
  }
}

async function dfs(x, y) {
  isRunning = true;
  if (
    !isValid(x, y) ||
    grid[x][y] === 1 ||
    grid[x][y] === 4 ||
    grid[x][y] === 5
  ) {
    isRunning = false;
    return false;
  }
  if (x === endPoint.x && y === endPoint.y) {
    isRunning = false;
    return true;
  }
  grid[x][y] = 5;
  drawGrid();
  const speed = document.getElementById("speed").value;
  const delay = speed === "fast" ? 50 : speed === "medium" ? 200 : 500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (
    (await dfs(x + 1, y)) ||
    (await dfs(x - 1, y)) ||
    (await dfs(x, y + 1)) ||
    (await dfs(x, y - 1))
  ) {
    grid[x][y] = 4;
    drawGrid();
    isRunning = false;
    return true;
  }
  grid[x][y] = 0;
  drawGrid();
  isRunning = false;
  return false;
}

async function bfs(x, y) {
  isRunning = true;
  const queue = [{ x, y }];
  const visited = new Set();
  const parent = new Map();
  while (queue.length > 0 && isRunning) {
    const { x, y } = queue.shift();
    if (
      !isValid(x, y) ||
      grid[x][y] === 1 ||
      visited.has(`${x},${y}`)
    ) {
      continue;
    }
    visited.add(`${x},${y}`);
    if (startPoint.x === x && startPoint.y === y) {
       grid[x][y] = 3;
    } else if (endPoint.x === x && endPoint.y === y){
      grid[x][y] = 2;
    } else {
      grid[x][y] = 5;
    }
    drawGrid();
    if (x === endPoint.x && y === endPoint.y) {
      let current = `${endPoint.x},${endPoint.y}`;
      while (parent.has(current)) {
        const [x, y] = current.split(",").map(Number);
        grid[x][y] = 4;
        drawGrid();  
        current = parent.get(current);
      }
      isRunning = false;
      return true;
    }
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    ];
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        parent.set(key, `${x},${y}`);
        queue.push(neighbor);
      }
    }
    const speed = document.getElementById("speed").value;
    const delay = speed === "fast" ? 50 : speed === "medium" ? 200 : 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  isRunning = false;
  return false;
}


async function dijkstra(x, y) {
  isRunning = true;
  const distances = new Array(gridWidth)
    .fill(null)
    .map(() => new Array(gridHeight).fill(Infinity));
  distances[x][y] = 0;
  const queue = [{ x, y }];
  const visited = new Set();
  while (queue.length > 0 && isRunning) {
    queue.sort((a, b) => distances[a.x][a.y] - distances[b.x][b.y]);
    const { x, y } = queue.shift();
    if (
      !isValid(x, y) ||
      grid[x][y] === 1 ||
      grid[x][y] === 4 ||
      visited.has(`${x},${y}`)
    ) {
      continue;
    }
    visited.add(`${x},${y}`);
    if (x === endPoint.x && y === endPoint.y) {
      await drawPath(distances);
      isRunning = false;
      return true;
    }
    grid[x][y] = 5;
    if (!visited.has(`${x},${y}`)) {
      grid[x][y] = 5;
    }
    drawGrid();
    const speed = document.getElementById("speed").value;
    const delay = speed === "fast" ? 50 : speed === "medium" ? 200 : 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
    const cost = distances[x][y] + 1;
    if (cost < distances[x + 1][y]) {
      distances[x + 1][y] = cost;
      queue.push({ x: x + 1, y });
    }
    if (distances[x + 1] !== undefined && cost < distances[x + 1][y]) {
      if (cost < distances[x - 1][y]) {
        distances[x - 1][y] = cost;
        queue.push({ x: x - 1, y });
      }
    }
    if (cost < distances[x][y + 1]) {
      distances[x][y + 1] = cost;
      queue.push({ x, y: y + 1 });
    }
    if (cost < distances[x][y - 1]) {
      distances[x][y - 1] = cost;
      queue.push({ x, y: y - 1 });
    }
  }
  drawGrid();
  isRunning = false;
  return false;
}

async function drawPath(distances) {
  let x = endPoint.x;
  let y = endPoint.y;
  grid[x][y] = 4;
  while (distances[x][y] !== 0) {
    const cost = distances[x][y];
    if (cost > distances[x + 1][y]) {
      x = x + 1;
    } else if (cost > distances[x - 1][y]) {
      x = x - 1;
    } else if (cost > distances[x][y + 1]) {
      y = y + 1;
    } else if (cost > distances[x][y - 1]) {
      y = y - 1;
    }
    grid[x][y] = 4;
    drawGrid();
    const speed = document.getElementById("speed").value;
    const delay = speed === "fast" ? 50 : speed === "medium" ? 200 : 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  drawGrid();
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
  const mazeSelect = document.getElementById("maze");
  const selectedMaze = mazeSelect.value;
  if (selectedMaze === "random") {
    generateRandomMaze();
  } else if (selectedMaze === "blank") {
    grid.fill(0);
  } else if (selectedMaze === "eller") {
    generateEllerMaze();
  } else if (selectedMaze === "kruskal") {
    generateKruskalMaze();
  } else if (selectedMaze === "binary-tree") {
    generateBinaryTreeMaze();
  } else if (selectedMaze === "spiral") {
    generateSpiralMaze();
  }
  drawGrid();
}

function generateSpiralMaze() {
  let x = 0,
    y = 0,
    dx = 0,
    dy = -1;
  for (let i = 0; i < gridWidth * gridHeight; i++) {
    if (
      -gridWidth / 2 < x &&
      x <= gridWidth / 2 &&
      -gridHeight / 2 < y &&
      y <= gridHeight / 2
    ) {
      setWall(x + gridWidth / 2, y + gridHeight / 2);
    }
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      [dx, dy] = [-dy, dx];
    }
    [x, y] = [x + dx, y + dy];
  }
  if (startPoint) {
    setStart(startPoint.x, startPoint.y);
  }
  if (endPoint) {
    setEnd(endPoint.x, endPoint.y);
  }
  drawGrid();
}

function generateBinaryTreeMaze() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (x % 2 === 0 || y % 2 === 0) {
        setWall(x, y);
      } else {
        grid[x][y] = 0;
      }
    }
  }
  for (let x = 2; x < gridWidth; x += 2) {
    for (let y = 2; y < gridHeight; y += 2) {
      const neighbors = [];
      if (isValid(x - 2, y)) {
        neighbors.push([x - 2, y]);
      }
      if (isValid(x, y - 2)) {
        neighbors.push([x, y - 2]);
      }
      if (neighbors.length > 0) {
        const [nx, ny] =
          neighbors[Math.floor(Math.random() * neighbors.length)];
        setWall(nx, ny);
      }
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

function generateEllerMaze() {
  const row = new Array(gridWidth).fill(1);
  for (let y = 0; y < gridHeight; y++) {
    // Carve vertical passages
    for (let x = 1; x < gridWidth; x += 2) {
      if (
        row[x] !== row[x - 1] &&
        (y === gridHeight - 1 || Math.random() < 0.5)
      ) {
        setWall(x, y);
        row[x] = row[x - 1];
      }
    }
    // Carve horizontal passages
    if (y === gridHeight - 1) {
      break;
    }
    const setCounts = new Map();
    for (let x = 0; x < gridWidth; x++) {
      if (!setCounts.has(row[x])) {
        setCounts.set(row[x], 0);
      }
      setCounts.set(row[x], setCounts.get(row[x]) + 1);
    }
    for (const [setNum, setCount] of setCounts) {
      const cellsInSet = [];
      [];
      for (let x = 0; x < gridWidth; x++) {
        if (row[x] === setNum) {
          cellsInSet.push(x);
        }
      }
      for (let i = 0; i < setCount - 1; i++) {
        const [x1, x2] = [cellsInSet[i], cellsInSet[i + 1]];
        if (Math.random() < 0.5) {
          setWall(x1, y);
          const newSetNum = (row[x1] = row[x2]);
          for (let x = 0; x < gridWidth; x++) {
            if (row[x] === setNum) {
              row[x] = newSetNum;
            }
          }
        }
      }
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

function generateKruskalMaze() {
  const edges = [];
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (x < gridWidth - 1) {
        edges.push({ x1: x, y1: y, x2: x + 1, y2: y });
      }
      if (y < gridHeight - 1) {
        edges.push({ x1: x, y1: y, x2: x, y2: y + 1 });
      }
    }
  }
  edges.sort(() => Math.random() - 0.5);
  const uf = new UnionFind(gridWidth * gridHeight);
  for (const { x1, y1, x2, y2 } of edges) {
    const id1 = y1 * gridWidth + x1;
    const id2 = y2 * gridWidth + x2;
    if (uf.find(id1) !== uf.find(id2)) {
      uf.union(id1, id2);
      setWall(x1, y1);
      setWall(x2, y2);
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

function handleMazeChange() {
  const mazeSelect = document.getElementById("maze");
  const selectedMaze = mazeSelect.value;
  if (selectedMaze === "random") {
    generateRandomMaze();
  } else if (selectedMaze === "blank") {
    grid.fill(0);
  } else if (selectedMaze === "spiral") {
    generateSpiralMaze();
  } else if (selectedMaze === "binary-tree") {
    generateBinaryTreeMaze();
  } else if (selectedMaze === "eller") {
    generateEllerMaze();
  } else if (selectedMaze === "kruskal") {
    generateKruskalMaze();
  }
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

function stop() {
  isRunning = false;
}

document.getElementById("start").addEventListener("click", () => {
  mode = "start";
});

document.getElementById("end").addEventListener("click", () => {
  mode = "end";
});

document.getElementById("wall").addEventListener("click", () => {
  mode = "wall";
});

const algorithmDropdown = document.getElementById("algorithm");
algorithmDropdown.addEventListener("change", () => {
  selectedAlgorithm = algorithmDropdown.value;
});

document.getElementById("run").addEventListener("click", () => {
  if (startPoint && endPoint) {
    switch (selectedAlgorithm) {
      case "dfs":
        dfs(startPoint.x, startPoint.y);
        break;
      case "bfs":
        bfs(startPoint.x, startPoint.y);
        break;
      case "dijkstra":
        dijkstra(startPoint.x, startPoint.y);
        break;
      default:
        console.error(`Unknown algorithm: ${selectedAlgorithm}`);
        break;
    }
  }
});

document.getElementById("clear").addEventListener("click", clearBoard);
document.getElementById("clear-walls").addEventListener("click", clearWalls);
document.getElementById("clear-path").addEventListener("click", clearPath);
document.getElementById("stop").addEventListener("click", stop);

document.getElementById("maze").addEventListener("change", handleMazeChange);

canvas.addEventListener("click", (e) => {
  const x = Math.floor(
    (e.clientX - canvas.getBoundingClientRect().left) / gridSize
  );
  const y = Math.floor(
    (e.clientY - canvas.getBoundingClientRect().top) / gridSize
  );
  if (mode === "start") {
    setStart(x, y);
  } else if (mode === "end") {
    setEnd(x, y);
  } else if (mode === "wall") {
    setWall(x, y);
  }
  drawGrid();
});

drawGrid();
