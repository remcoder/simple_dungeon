const cellSize = 200;
const WALL = "#";
const FLOOR = ".";
//   const map = [
// '#.#.',
// '....',
// '#...',
// '....',
// ];
const map = [
'..#####.....',
'..#..##.....',
'.#....#.....',
'..#...#.....',
'..#....#....',
'..#....#....',
'..#...#.....',
'##...######.',
'#..........#',
'#..........#'];

var app = new Vue({
el: '#app',
data: {
  title: 'Simple Dungeon',
  walking: false,
  cells: processMap(map),
  camera: {
    position: {
      row : 9,
      column: 2
    },
    angle : 0
  },
  mapSize : 200,
},
methods :  {
  handleKeyDown(evt) {
    var row, cell;
    // console.log(evt, evt.key)
    switch(evt.key) {
      case "ArrowUp":
        this.moveInDirection(this.camera.angle);
        break;
      
      case "ArrowDown": 
        this.moveInDirection((this.camera.angle + 2) % 4 );
        break;
      
      case "ArrowLeft":
        if (evt.altKey)
          this.moveInDirection((this.camera.angle + 3) % 4 );
        else
          this.camera.angle = (this.camera.angle + 4 -1) % 4;
        console.log(this.camera.angle)
        // if (map[this.camera.position.row][this.camera.position.column-1] == FLOOR)
        //   this.camera.position.column--
        break;
      
      case "ArrowRight": 
        if (evt.altKey)
          this.moveInDirection((this.camera.angle + 1) % 4 );
        else
          this.camera.angle = (this.camera.angle + 1) % 4;
        console.log(this.camera.angle)
        // if (map[this.camera.position.row][this.camera.position.column+1] != WALL)
        //   this.camera.position.column++
        break;
    }
  },

  moveInDirection(angle) {
    console.log("move to " + angle)
    switch (angle) {
        case 0:
          this.move(0,-1)
          break;
        case 1:
          this.move(1,0);
          break;
        case 2:
          this.move(0,1);
          break;
        case 3:
          this.move(-1,0);
          break;
      }
  },

  move(dx,dy) {
    const newRow = this.camera.position.row + dy
    const row = map[newRow];
    if (!row) return;
    const newColumn = this.camera.position.column + dx
    const cell = row[newColumn];
    
    if (cell == FLOOR) { 
      this.camera.position.row = newRow;
      this.camera.position.column = newColumn;
    }

    document.title = `x:${newColumn}, y:${newRow}`;
  },

  brightness(cell) {
    var dx = cell.rowIndex;
    var dy = cell.cellIndex;
    var d = Math.sqrt(dx*dx + dy*dy);
    var b = Math.pow(1.3,-1-d);
    var s = `brightness(${b})`;
    return s;
  },

  transform(cell) {
    var mapSize = map.length-1;
    var dx = cell.cellIndex*cellSize + 50;
    var dz = cell.rowIndex + 0.75;
    var t = `translate3d(${ dx }px, 0px, ${ dz*cellSize }px)`;
    return t;
  },
  
  visible(cell) {
    var dx = cell.rowIndex;
    var dy = cell.cellIndex;
    var d = Math.sqrt(dx*dx + dy*dy);
    // to calc what is in view, start with a square triangle
    // then add anything that show up
    var isInFOV = (cell.cellIndex >= cell.rowIndex && -cell.cellIndex >= cell.rowIndex) || 
      (cell.rowIndex == 0 && cell.cellIndex == 1) || 
      (cell.rowIndex == 0 && cell.cellIndex == -1) || 
      (cell.rowIndex == -1 && cell.cellIndex == 2) || 
      (cell.rowIndex == -1 && cell.cellIndex == -2);
    const isInFront = cell.rowIndex <= 0;
    return isInFront && isInFOV && d < 10;
  },

  mapTransform(cell) {
    // console.log(cell.cellIndex, cell.rowIndex);
    const size = this.mapCellSize();
    const x = cell.cellIndex * size;
    const y = cell.rowIndex * size;
    const offset = this.mapSize/2 - size/2;
    const t= `translate3d(${offset}px,${offset}px,0) translate3d(${x}px, ${y}px, 0px)`;
    return t;
  },

  showOnMap(cell) {
    const x = cell.cellIndex;
    const y = cell.rowIndex;
    var dx = cell.rowIndex;
    var dy = cell.cellIndex;
    var d = Math.sqrt(dx*dx + dy*dy);
    return d< 5;
  },

  getTileType(cell) {
    const pos = this.camera.position;
    const classList = [];
    if (cell.rowIndex == 0 && cell.cellIndex == 0)
      classList.push("player");
    if (cell.wall)
      classList.push("wall");
    if (cell.floor)
      classList.push("floor");
    if (this.visible(cell))
      classList.push("rendered");
    return classList
  },

  mapCellSize() {
    return this.mapSize / map.length;
  },

  rotate(cells) {
    var rotated;
    var max = map.length-1;
    return cells.map(c => {
      switch (this.camera.angle) {
        case 0: // 0 degrees
           rotated = Object.assign({}, c);
           rotated.rowIndex = c.rowIndex - this.camera.position.row;
           rotated.cellIndex = c.cellIndex - this.camera.position.column;
           return rotated
        case 1: // 90 degrees
           rotated = Object.assign({}, c);
           rotated.cellIndex = c.rowIndex - this.camera.position.row;
           rotated.rowIndex = max - c.cellIndex - (max - this.camera.position.column);
           return rotated
        case 2: // 180 degrees
        rotated = Object.assign({}, c);
        rotated.cellIndex = max - c.cellIndex - (max - this.camera.position.column);
           rotated.rowIndex = max - c.rowIndex - (max - this.camera.position.row);
           return rotated
          break;
        case 3: // 270 degrees
        rotated = Object.assign({}, c);
           rotated.cellIndex = max - c.rowIndex - (max - this.camera.position.row);
           rotated.rowIndex = c.cellIndex - this.camera.position.column;
           return rotated
          break;
      }
    });
  },

  translate(cells) {
    var rotated;
    var max = map.length-1;
    return cells.map(c => {
      rotated = Object.assign({}, c);
      rotated.rowIndex = c.rowIndex - this.camera.position.row;
      rotated.cellIndex = c.cellIndex - this.camera.position.column;
      return rotated
    });
  }
},
mounted() {
  this.move(0,0);
  document.addEventListener('keydown', this.handleKeyDown);
},
})

function processMap(map) {
var cells = [];
map.forEach((r,rowIndex) => { 
  r.split("").forEach((c,cellIndex)=>{
    cells.push({
      rowIndex,
      cellIndex,
      wall : c == "#",
      floor : c == "."
    });
  });
});
return cells;
}
