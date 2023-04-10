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
const directions = [
  { dx: -1, dy: 0 }, // left
  { dx: 1, dy: 0 }, // right
  { dx: 0, dy: -1 }, // up
  { dx: 0, dy: 1 }, // down
];
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

setStart(5, 7);
setEnd(20, 5);

let startTime, endTime;
let comparisons = 0;

// DFS search
async function dfs(x, y, visited = new Set()) {
  path = [];
  startTime = performance.now();
  if (!isValid(x, y) || visited.has(`${x},${y}`)) {
    return false;
  }
  if (x === endPoint.x && y === endPoint.y) {
    // Set end time
    endTime = performance.now();

    // Display analytics
    const time = endTime - startTime;
    const memory = performance.memory.usedJSHeapSize / 1024;
    document.getElementById("time").innerText = time.toFixed(2);
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("memory").innerText = memory.toFixed(2);
    isRunning = false;
    return true;
  }
  visited.add(`${x},${y}`);
  path.push({ x, y });
  grid[x][y] = 5;
  drawGrid();
  const speed = document.getElementById("speed").value;
  const delay = speed === "fast" ? 50 : speed === "medium" ? 200 : 500;
  await new Promise((resolve) => setTimeout(resolve, delay));
  if (isRunning) {
    comparisons++;
    if (
      (await dfs(x + 1, y, visited, path)) ||
      (await dfs(x - 1, y, visited, path)) ||
      (await dfs(x, y + 1, visited, path)) ||
      (await dfs(x, y - 1, visited, path))
    ) {
      grid[x][y] = 4;
      path.push({ x, y });
      for (const cell of path) {
        grid[cell.x][cell.y] = 4;
      }
      setTimeout(() => {
        drawGrid();
      }, delay);
      isRunning = false;
      return true;
    }
  }
  visited.delete(`${x},${y}`);
  path.pop();
  isRunning = false;
  return false;
}

// async function dfs(x, y) {
//   startTime = performance.now();
//   if (
//     !isValid(x, y) ||
//     grid[x][y] === 1 ||
//     grid[x][y] === 4 ||
//     grid[x][y] === 5
//   ) {
//     isRunning = false;
//     return false;
//   }
//   if (x === endPoint.x && y === endPoint.y) {
//     // Set end time
//     endTime = performance.now();

//     // Display analytics
//     const time = endTime - startTime;
//     const memory = performance.memory.usedJSHeapSize / 1024;
//     document.getElementById("time").innerText = time.toFixed(2);
//     document.getElementById("comparisons").innerText = comparisons;
//     document.getElementById("memory").innerText = memory.toFixed(2);
//     isRunning = false;
//     return true;
//   }
//   grid[x][y] = 5;
//   drawGrid();
//   const speed = document.getElementById("speed").value;
//   const delay = speed === "fast" ? 50 : speed === "medium" ? 200 : 500;
//   await new Promise((resolve) => setTimeout(resolve, delay));
//   if (isRunning) {
//     comparisons++;
//     if (
//       (await dfs(x + 1, y)) ||
//       (await dfs(x - 1, y)) ||
//       (await dfs(x, y + 1)) ||
//       (await dfs(x, y - 1))
//     ) {
//       grid[x][y] = 4;
//       drawGrid();
//       isRunning = false;
//       return true;
//     }
//   }
//   // grid[x][y] = 0;
//   // drawGrid();
//   isRunning = false;
//   return false;
// }

// BFS
async function bfs(x, y) {
  startTime = performance.now();
  isRunning = true;
  const queue = [{ x, y }];
  const visited = new Set();
  const parent = new Map();
  while (queue.length > 0 && isRunning) {
    const { x, y } = queue.shift();
    if (!isValid(x, y) || grid[x][y] === 1 || visited.has(`${x},${y}`)) {
      continue;
    }
    visited.add(`${x},${y}`);
    comparisons++;
    if (startPoint.x === x && startPoint.y === y) {
      grid[x][y] = 3;
    } else if (endPoint.x === x && endPoint.y === y) {
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
      endTime = performance.now();
      // Display analytics
      const time = endTime - startTime;
      const memory = performance.memory.usedJSHeapSize / 1024;
      document.getElementById("time").innerText = time.toFixed(2);
      document.getElementById("comparisons").innerText = comparisons;
      document.getElementById("memory").innerText = memory.toFixed(2);
      isRunning = false;
      return true;
    }
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
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
  startTime = performance.now();
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
    comparisons++;
    if (x === endPoint.x && y === endPoint.y) {
      await drawPath(distances);
      endTime = performance.now();
      // Display analytics
      const time = endTime - startTime;
      const memory = performance.memory.usedJSHeapSize / 1024;
      document.getElementById("time").innerText = time.toFixed(2);
      document.getElementById("comparisons").innerText = comparisons;
      document.getElementById("memory").innerText = memory.toFixed(2);
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

    // Finds the shortest path between start and end point using visited nodes
    const cost = distances[x][y] + 1;
    if (
      isValid(x + 1, y) &&
      grid[x + 1][y] !== 1 &&
      cost < distances[x + 1][y]
    ) {
      distances[x + 1][y] = cost;
      queue.push({ x: x + 1, y });
    }
    if (
      isValid(x - 1, y) &&
      grid[x - 1][y] !== 1 &&
      cost < distances[x - 1][y]
    ) {
      distances[x - 1][y] = cost;
      queue.push({ x: x - 1, y });
    }
    if (
      isValid(x, y + 1) &&
      grid[x][y + 1] !== 1 &&
      cost < distances[x][y + 1]
    ) {
      distances[x][y + 1] = cost;
      queue.push({ x, y: y + 1 });
    }
    if (
      isValid(x, y - 1) &&
      grid[x][y - 1] !== 1 &&
      cost < distances[x][y - 1]
    ) {
      distances[x][y - 1] = cost;
      queue.push({ x, y: y - 1 });
    }
  }
  drawGrid();
  isRunning = false;
  return false;
}
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  enqueue(item) {
    this.elements.push(item);
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift();
  }
}

function heuristic(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function greedy(startX, startY) {
  startTime = performance.now();
  const queue = new PriorityQueue();
  queue.enqueue({ x: startX, y: startY, priority: 0 });
  const cameFrom = new Map();
  cameFrom.set(`${startX},${startY}`, null);
  const costSoFar = new Map();
  costSoFar.set(`${startX},${startY}`, 0);
  let isPathFound = false;
  let counter = 0;

  while (!queue.isEmpty()) {
    const current = queue.dequeue();
    const { x, y } = current;

    if (grid[x][y] !== 2 || grid[x][y] !== 1 || grid[x][y] !== 3) {
      comparisons++;
      grid[x][y] = 5; // mark as visited (yellow)
      drawGrid();
    }

    if (x === endPoint.x && y === endPoint.y) {
      isPathFound = true;
      break;
    }

    for (const { dx, dy } of directions) {
      const nextX = x + dx;
      const nextY = y + dy;

      if (nextX < 0 || nextX >= gridWidth || nextY < 0 || nextY >= gridHeight) {
        continue;
      }

      if (grid[nextX][nextY] === 1) {
        continue;
      }

      const priority = heuristic(nextX, nextY, endPoint.x, endPoint.y);
      const newCost = costSoFar.get(`${x},${y}`) + 1;

      if (
        !costSoFar.has(`${nextX},${nextY}`) ||
        newCost < costSoFar.get(`${nextX},${nextY}`)
      ) {
        costSoFar.set(`${nextX},${nextY}`, newCost);
        queue.enqueue({ x: nextX, y: nextY, priority });
        cameFrom.set(`${nextX},${nextY}`, { x, y });
      }
    }
    counter++;
    await sleep(5); // add delay for visualization
  }

  if (isPathFound) {
    let current = { x: endPoint.x, y: endPoint.y };
    while (current.x !== startX || current.y !== startY) {
      current = cameFrom.get(`${current.x},${current.y}`);
      grid[current.x][current.y] = 4; // mark as part of the path (blue)
      drawGrid();
      await sleep(20); // add delay for visualization
    }
    grid[startX][startY] = 3; // mark as start point
    grid[endPoint.x][endPoint.y] = 3; // mark as end point
    drawGrid();
  } else {
    console.log("No path found");
  }
  endTime = performance.now();
  // Display analytics
  const time = endTime - startTime;
  const memory = performance.memory.usedJSHeapSize / 1024;
  document.getElementById("time").innerText = time.toFixed(2);
  document.getElementById("comparisons").innerText = comparisons;
  document.getElementById("memory").innerText = memory.toFixed(2);
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

function emptyGrid() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (
        startPoint === null ||
        endPoint === null ||
        (startPoint.x != x &&
          startPoint.y != y &&
          endPoint.x != x &&
          endPoint.y != y)
      ) {
        grid[x][y] = 0;
      }
    }
  }
  drawGrid(); // redraw the grid to update the canvas
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
    emptyGrid();
    grid.fill(0);
  } else if (selectedMaze === "eller") {
    emptyGrid();
    generateEllerMaze();
  } else if (selectedMaze === "kruskal") {
    emptyGrid();
    generateKruskalMaze();
  } else if (selectedMaze === "binary-tree") {
    emptyGrid();
    generateBinaryTreeMaze();
  } else if (selectedMaze === "spiral") {
    emptyGrid();
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
  const sets = new Array(gridWidth)
    .fill()
    .map(() => new Array(gridHeight).fill(0));
  let setCount = 0;
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      sets[x][y] = setCount++;
    }
  }
  for (const { x1, y1, x2, y2 } of edges) {
    const setId1 = sets[x1][y1];
    const setId2 = sets[x2][y2];
    if (setId1 !== setId2) {
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          if (sets[x][y] === setId2) {
            sets[x][y] = setId1;
          }
        }
      }
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

function clearBoard() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      grid[x][y] = 0;
    }
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
        if (endPoint.x === x && endPoint.y === y) {
          grid[x][y] = 2;
        } else if (startPoint.x === x && startPoint.y === y) {
          grid[x][y] = 3;
        } else {
          grid[x][y] = 0;
        }
      }
    }
  }
  drawGrid();
}

function stop() {
  isRunning = false;
}

const popupContent = [
  {
    title: "Welcome!",
    text: "This is a brief overview of how to use the website.",
  },
  {
    title: "Step 1",
    text: "First, click on the 'Generate Maze' button to create a maze.",
  },
  {
    title: "Step 2",
    text: "Choose an algorithm from the dropdown menu and click on the 'Run Algorithm' button.",
  },
  {
    title: "Step 3",
    text: "To change the speed of the algorithm, select a different option from the 'Speed' dropdown menu.",
  },
  {
    title: "Step 4",
    text: "You can also draw walls on the grid by clicking and dragging your mouse.",
  },
  {
    title: "Done!",
    text: "You're now ready to explore the maze and experiment with different algorithms!",
  },
  {
    title: "Select Algorithm",
    text: "Choose an algorithm from the dropdown menu and click on the 'Run Algorithm' button.",
  },
];

let currentPage = 0;
// Show the tutorial popup when the page loads
window.addEventListener("load", () => {
  const popup = document.getElementById("popup");
  const closeButton = document.getElementById("close-button");

  function hidePopup() {
    popup.style.display = "none";
  }

  function showPopup() {
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popup-title");
    const popupText = document.getElementById("popup-text");
    popup.style.display = "block";
    popupTitle.innerText = popupContent[currentPage].title;
    popupText.innerText = popupContent[currentPage].text;
  }

  function previousPage() {
    if (currentPage > 0) {
      currentPage--;
      showPopup();
    }
  }

  function nextPage() {
    if (currentPage < popupContent.length - 2) {
      currentPage++;
      showPopup();
    }
  }

  function handlePreviousClick() {
    previousPage();
    //console.log("Previous button clicked");
  }

  function handleNextClick() {
    nextPage();
    //console.log("Next button clicked");
  }

  // Add event listeners to the buttons
  closeButton.addEventListener("click", hidePopup);
  document
    .getElementById("popup-previous")
    .addEventListener("click", handlePreviousClick);
  document
    .getElementById("popup-next")
    .addEventListener("click", handleNextClick);

  // Show the popup
  showPopup();
});

document.getElementById("start").addEventListener("click", () => {
  mode = "start";
});

document.getElementById("end").addEventListener("click", () => {
  mode = "end";
});

document.getElementById("wall").addEventListener("click", () => {
  mode = "wall";
});

let selectedAlgorithm = null;
const algorithmDropdown = document.getElementById("algorithm");
algorithmDropdown.addEventListener("change", () => {
  selectedAlgorithm = algorithmDropdown.value;
  if (selectedAlgorithm === null) {
    currentPage = 6;
    showPopup();
  }
});

document.getElementById("run").addEventListener("click", () => {
  if (selectedAlgorithm != null) {
    if (startPoint && endPoint && selectedAlgorithm) {
      switch (selectedAlgorithm) {
        case "dfs":
          isRunning = true;
          dfs(startPoint.x, startPoint.y);
          break;
        case "bfs":
          bfs(startPoint.x, startPoint.y);
          break;
        case "dijkstra":
          dijkstra(startPoint.x, startPoint.y);
          break;
        case "greedy":
          greedy(startPoint.x, startPoint.y);
          break;
        default:
          console.error(`Unknown algorithm: ${selectedAlgorithm}`);
          break;
      }
    } else {
      currentPage = 6;
      showPopup();
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

let isDraggingStart = false;
let isDraggingEnd = false;

canvas.addEventListener("mousedown", (event) => {
  const x = Math.floor(event.offsetX / gridSize);
  const y = Math.floor(event.offsetY / gridSize);
  if (x === startPoint.x && y === startPoint.y) {
    isDraggingStart = true;
  } else if (x === endPoint.x && y === endPoint.y) {
    isDraggingEnd = true;
  }
});

function isWall(x, y) {
  return grid[x][y] === 1;
}

canvas.addEventListener("mousemove", (event) => {
  if (isDraggingStart) {
    const x = Math.floor(event.offsetX / gridSize);
    const y = Math.floor(event.offsetY / gridSize);
    if (
      isValid(x, y) &&
      !isWall(x, y) &&
      (x !== endPoint.x || y !== endPoint.y)
    ) {
      startPoint.x = x;
      startPoint.y = y;
      drawGrid();
    }
  } else if (isDraggingEnd) {
    const x = Math.floor(event.offsetX / gridSize);
    const y = Math.floor(event.offsetY / gridSize);
    if (
      isValid(x, y) &&
      !isWall(x, y) &&
      (x !== startPoint.x || y !== startPoint.y)
    ) {
      endPoint.x = x;
      endPoint.y = y;
      drawGrid();
    }
  }
});

canvas.addEventListener("mouseup", () => {
  isDraggingStart = false;
  isDraggingEnd = false;
});

drawGrid();

// Fixed the clear path option
// Fixed path going through the wall.
// Add animating by adding another color to visited cells.

