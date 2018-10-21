
const WALL = "#";
const FLOOR = ".";
const MONSTER = "M";
const map = [
'..#####.....',
'..#..##.....',
'.#....#.....',
'..#.M.#.....',
'..#....#....',
'..#....#....',
'..#...#.....',
'##...######.',
'#..........#',
'############'];

var app = new Vue({
el: '#app',
data: {
  debug: false,
  title: 'Ye Olde Dungeon',
  walking: false,
  cells: processMap(map),
  camera: {
    position: {
      row : 8,
      column: 2
    },
    angle : 0
  },
  tileSize: 300,
  mapSize: 200
},
methods :  {
  handleKeyDown(evt) {
    var row, cell;
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
        break;
      
      case "ArrowRight": 
        if (evt.altKey)
          this.moveInDirection((this.camera.angle + 1) % 4 );
        else
          this.camera.angle = (this.camera.angle + 1) % 4;
        break;
    }
  },

  moveInDirection(angle) {
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
  },

  brightness(cell) {
    const dx = cell.rowIndex;
    const dy = cell.cellIndex;
    const d = Math.sqrt(dx*dx + dy*dy);
    const b = Math.max(0, 1.2 - 0.3 * d); //Math.pow(1.3,-1-d);
    const s = `brightness(${b})`;
    return s;
  },

  transform(cell) {
    const dx = cell.cellIndex;
    const dz = cell.rowIndex + 0.7;
    const dy = 0;-0.4;
    const t = `translate3d(${ dx * this.tileSize }px, ${dy * this.tileSize}px, ${ dz*this.tileSize }px)`;
    return t;
  },
  
  visible(cell) {
    const dx = cell.rowIndex;
    const dy = cell.cellIndex;
    const d = Math.sqrt(dx*dx + dy*dy);
    // to calc what is in view, start with a square triangle
    // then add anything that show up
    const isInFOV = (cell.cellIndex >= cell.rowIndex && -cell.cellIndex >= cell.rowIndex) || 
      (cell.rowIndex == 0 && cell.cellIndex == 1) || 
      (cell.rowIndex == 0 && cell.cellIndex == -1) || 
      (cell.rowIndex == -1 && cell.cellIndex == 2) || 
      (cell.rowIndex == -1 && cell.cellIndex == -2);
    const isInFront = cell.rowIndex <= 0;
    return isInFront && isInFOV && d < 8;
  },

  mapTransform(cell) {
    const size = this.mapCellSize();
    const x = cell.cellIndex * size;
    const y = cell.rowIndex * size;
    const offset = this.mapSize/2 - size/2;
    var t= `translate3d(${offset}px,${offset}px,0) translate3d(${x}px, ${y}px, 0px)`;

    if (cell.tileType)
      if (cell.tileType.indexOf("player") > -1)
          t += " " +this.rotateOnMap(-1);
    
    return t;
  },

  showOnMap(cell) {
    const x = cell.cellIndex;
    const y = cell.rowIndex;
    const dx = cell.rowIndex;
    const dy = cell.cellIndex;
    const d = Math.sqrt(dx*dx + dy*dy);
    return d< 5;
  },

  mapCellSize() {
    return this.mapSize / map.length;
  },

  getTileType(cell) {
    const classList = [];
    if (cell.rowIndex == 0 && cell.cellIndex == 0)
      classList.push("player");
    if (cell.wall)
      classList.push("map-wall");
    if (cell.monster)
      classList.push("map-monster");  
    else if (cell.floor)
      classList.push("map-floor");
    if (this.visible(cell))
      classList.push("rendered");
    return classList
  },

  rotateOnMap(offsetAngle) {
    return `rotate(${(offsetAngle+this.camera.angle) * 90}deg)`;
  },

  rotate(cells) {
    var rotated;
    const max = map.length-1;
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
    return cells.map(c => {
      rotated = Object.assign({}, c);
      rotated.rowIndex = c.rowIndex - this.camera.position.row;
      rotated.cellIndex = c.cellIndex - this.camera.position.column;
      rotated.tileType = this.getTileType(rotated);
      return rotated;
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
        wall : c == WALL,
        floor : c == FLOOR || c == MONSTER,
        monster : c == MONSTER
      });
    });
  });
  return cells;
}
