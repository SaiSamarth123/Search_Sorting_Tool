// create canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// define grid size and cell size
const gridSize = {
    x: 300,
    y: 300
};
const cellSize = {
    x: 25,
    y: 25
};

// define colors
const colors = {
    open: '#ffffff',
    wall: '#333333',
    start: '#00ff00',
    end: '#ff0000',
    visited: '#b8b8b8',
    path: '#00bfff'
};

// create grid
let grid = [];

// start and end points
let startPoint = null;
let endPoint = null;

// start button and initializing the start point
document.getElementById('startBtn').addEventListener('click', function() {
  canvas.addEventListener('mousedown', function(event) {
    const x = Math.floor(event.offsetX / cellSize.x);
    const y = Math.floor(event.offsetY / cellSize.y);
    start = { x, y };
    fillCell(x, y, colors.start);
  });
});

//
document.getElementById('endBtn').addEventListener('click', function() {
  canvas.addEventListener('mousedown', function(event) {
    const x = Math.floor(event.offsetX / cellSize.x);
    const y = Math.floor(event.offsetY / cellSize.y);
    end = { x, y };
    fillCell(x, y, colors.end);
  });
});


// creating the grid
function createGrid() {
    for (let i = 0; i < gridSize.x; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize.y; j++) {
            grid[i][j] = 0;
        }
    }
}

// draw grid
function drawGrid() {
    ctx.beginPath();
    for (let i = 0; i <= gridSize.x; i++) {
        ctx.moveTo(i * cellSize.x, 0);
        ctx.lineTo(i * cellSize.x, gridSize.y * cellSize.y);
    }
    for (let j = 0; j <= gridSize.y; j++) {
        ctx.moveTo(0, j * cellSize.y);
        ctx.lineTo(gridSize.x * cellSize.x, j * cellSize.y);
    }
    ctx.stroke();

    // for (let i = 0; i < gridSize.x; i++) {
    // for (let j = 0; j < gridSize.y; j++) {
    //   const cell = i + ',' + j;
    //   if (start && start.x === i && start.y === j) {
    //     fillCell(i, j, colors.start);
    //   } else if (end && end.x === i && end.y === j) {
    //     fillCell(i, j, colors.end);
    //   } else if (path.has(cell)) {
    //     fillCell(i, j, colors.path);
    //   } else if (visited.has(cell)) {
    //     fillCell(i, j, colors.visited);
    //   } else if (grid[i][j] === 1) {
    //     fillCell(i, j, colors.wall);
    //   } else {
    //     fillCell(i, j, colors.open);}
    // }}
}

// fill cell
function fillCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize.x + 1, y * cellSize.y + 1, cellSize.x - 2, cellSize.y - 2);
}

// handle mouse events
canvas.addEventListener('mousedown', function (event) {
    const x = Math.floor(event.offsetX / cellSize.x);
    const y = Math.floor(event.offsetY / cellSize.y);
    if (event.button === 0) {
        // left click: add wall
        grid[x][y] = 1;
        fillCell(x, y, colors.wall);
    } else if (event.button === 2) {
        // right click: remove wall
        grid[x][y] = 0;
        fillCell(x, y, colors.open);
    }
});

document.getElementById('dfsBtn').addEventListener('click', function() {
  const visited = createVisited();
  const path = dfs(start, end, visited);
  if (path) {
    for (const { x, y } of path) {
      fillCell(x, y, colors.path);
    }
  }
});

// // returns a visited array to be used by search algorithms
// function createVisited() {
//   let visited = [];
//   for (let i = 0; i < gridSize.x; i++) {
//     visited[i] = [];
//     for (let j = 0; j < gridSize.y; j++) {
//       visited[i][j] = false;
//     }
//   }
//   return visited;
// }



// // Search Algorithms

// // DFS





// create visited array
function createVisited() {
  let visited = new Set();
  for (let i = 0; i < gridSize.x; i++) {
    for (let j = 0; j < gridSize.y; j++) {
      visited.add([i, j].toString());
    }
  }
  return visited;
}

function dfs(graph, start, end, visited = createVisited()) {
  visited.add(start.x + ',' + start.y);
  if (start.x === end.x && start.y === end.y) {
    // base case: found end point
    console.log('here');
    fillCell(start.x, start.y, colors.path);
    return true;
  }
  for (const neighbor of getNeighbors(start.x, start.y, grid)) {
    const [nx, ny] = neighbor;
    if (!visited.has(nx + ',' + ny) && dfs(graph, { x: nx, y: ny }, end, visited)) {
      // recursive case: found end point through this neighbor
      console.log('here');
      fillCell(start.x, start.y, colors.path);
      visited.add(start.x + ',' + start.y);
      return true;
    }
  }
  // base case: end point not found
  console.log('here');
  fillCell(start.x, start.y, colors.visited);
  return false;
}


function getNeighbors(x, y, graph) {
  const neighbors = [];
  if (x > 0 && graph[x - 1][y] !== 1) {
    neighbors.push([x - 1, y]);
  }
  if (x < gridSize.x - 1 && graph[x + 1][y] !== 1) {
    neighbors.push([x + 1, y]);
  }
  if (y > 0 && graph[x][y - 1] !== 1) {
    neighbors.push([x, y - 1]);
  }
  if (y < gridSize.y - 1 && graph[x][y + 1] !== 1) {
    neighbors.push([x, y + 1]);
  }
  return neighbors;
}




// initialize grid
createGrid();

// draw grid
drawGrid();
