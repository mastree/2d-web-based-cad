import {fetchShader} from "./api/shader.js";
import MapItem from "./utils/item.js";
import ItemManager from "./utils/itemManager.js";
function stringToColorList(color) {
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  return [r / 256, g / 256, b / 256, 1];
}
let cadState = {
  mousePos: {x: 0, y: 0},
  state: "nothing",
  bufferItem: [],
  lastSelect: -1,
  initPos: {x: 0, y: 0},
  drawSquare: false
};
var canvas = document.getElementById("Drawing-surface");
canvas.width = 800;
canvas.height = 600;
canvas.addEventListener("mousemove", (event) => {
  const bound = canvas.getBoundingClientRect();
  const res = {
    x: event.clientX - bound.left,
    y: canvas.height - (event.clientY - bound.top)
  };
  cadState.mousePos = res;
}, false);
canvas.addEventListener("click", (event) => {
  const bound = canvas.getBoundingClientRect();
  console.log(cadState.mousePos.x, cadState.mousePos.y);
}, false);
var gl = canvas.getContext("webgl");
if (!gl) {
  gl = canvas.getContext("experimental-webgl");
}
async function main() {
  if (!gl) {
    alert("Your browser does not support WebGL");
    return;
  }
  var vert = await fetchShader("vertexShader.glsl");
  var frag = await fetchShader("fragmentShader.glsl");
  gl.viewport(0, 0, canvas.width, canvas.height);
  console.log(canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertShader, vert);
  gl.compileShader(vertShader);
  gl.shaderSource(fragShader, frag);
  gl.compileShader(fragShader);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  var manager = new ItemManager();
  function saveProject() {
    let proj = document.getElementById("projState");
    proj.value = JSON.stringify(manager);
  }
  function loadFile() {
    let input = document.getElementById("myfile");
    let files = input.files;
    let f = files[0];
    let reader = new FileReader();
    let fileContent = "";
    reader.onload = function(evt) {
      if (evt.target.readyState != 2)
        return;
      if (evt.target.error) {
        alert("Error while reading file");
        return;
      }
      fileContent = evt.target.result;
      manager = new ItemManager();
      let nmanager = JSON.parse(fileContent);
      for (const obj of nmanager.items) {
        let item = new MapItem(gl, shaderProgram);
        item.vertices = obj.vertices;
        item.pos = obj.pos;
        item.colors = obj.colors;
        item.projectionMatrix = obj.projectionMatrix;
        manager.push(item);
      }
      manager.render();
    };
    reader.readAsText(f);
  }
  var drawEvent = {
    click: function click() {
      const bound = canvas.getBoundingClientRect();
      let item = new MapItem(gl, shaderProgram);
      item.createItem([cadState.mousePos.x, cadState.mousePos.y], [1, 0, 0, 1]);
      cadState.bufferItem.push(item);
      manager.renderWith(cadState.bufferItem);
    }
  };
  var drawSquareEvent = {
    mousedown: function onmousedown() {
      let len = manager.items.length;
      cadState.initPos.x = cadState.mousePos.x;
      cadState.initPos.y = cadState.mousePos.y;
      cadState.drawSquare = true;
    },
    mouseup: function onmouseup() {
      let delx = Math.abs(cadState.mousePos.x - cadState.initPos.x);
      let dely = Math.abs(cadState.mousePos.y - cadState.initPos.y);
      let mx = Math.max(delx, dely);
      let item = new MapItem(gl, shaderProgram);
      item.createItem([mx, mx, mx, -mx, -mx, mx, -mx, -mx], [1, 0, 0, 1]);
      item.setPosition(cadState.initPos.x, cadState.initPos.y);
      manager.push(item);
      manager.render();
      cadState.drawSquare = false;
    },
    mousemove: function onmove() {
      if (cadState.drawSquare) {
        let delx = Math.abs(cadState.mousePos.x - cadState.initPos.x);
        let dely = Math.abs(cadState.mousePos.y - cadState.initPos.y);
        let mx = Math.max(delx, dely);
        let item = new MapItem(gl, shaderProgram);
        item.createItem([mx, mx, mx, -mx, -mx, mx, -mx, -mx], [1, 0, 0, 1]);
        item.setPosition(cadState.initPos.x, cadState.initPos.y);
        manager.renderWith([item]);
      }
    }
  };
  var selectEvent = {
    click: function click() {
      let len = manager.items.length;
      let ins = -1;
      for (let i = 0; i < len; i++) {
        if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y))
          ins = i;
      }
      console.log(ins);
    }
  };
  var moveEvent = {
    mousedown: function onmousedown() {
      let len = manager.items.length;
      let ins = -1;
      for (let i = 0; i < len; i++) {
        if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y))
          ins = i;
      }
      if (ins != -1) {
        cadState.initPos.x = cadState.mousePos.x;
        cadState.initPos.y = cadState.mousePos.y;
        manager.push(manager.items[ins]);
        manager.deleteItem(ins);
        ins = manager.items.length - 1;
      }
      cadState.lastSelect = ins;
    },
    mouseup: function onmouseup() {
      cadState.lastSelect = -1;
    },
    mousemove: function onmove() {
      if (cadState.lastSelect != -1) {
        manager.items[cadState.lastSelect].translateItem(cadState.mousePos.x - cadState.initPos.x, cadState.mousePos.y - cadState.initPos.y);
        cadState.initPos = cadState.mousePos;
        manager.render();
      }
    }
  };
  var resizeEvent = {
    mousedown: function onmousedown() {
      let len = manager.items.length;
      let ins = -1;
      for (let i = 0; i < len; i++) {
        if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y))
          ins = i;
      }
      cadState.lastSelect = ins;
      if (ins != -1) {
        cadState.initPos.x = cadState.mousePos.x;
        cadState.initPos.y = cadState.mousePos.y;
      }
    },
    mouseup: function onmouseup() {
      cadState.lastSelect = -1;
    },
    mousemove: function onmove() {
      if (cadState.lastSelect != -1) {
        let cx = manager.items[cadState.lastSelect].pos[0];
        let cy = manager.items[cadState.lastSelect].pos[1];
        let initdelx = cadState.initPos.x - cx;
        let initdely = cadState.initPos.y - cy;
        let curdelx = cadState.mousePos.x - cx;
        let curdely = cadState.mousePos.y - cy;
        manager.items[cadState.lastSelect].scaleItem(curdely / initdely);
        cadState.initPos = cadState.mousePos;
        manager.render();
      }
    }
  };
  var changeColorEvent = {
    click: function click() {
      let len = manager.items.length;
      let ins = -1;
      for (let i = 0; i < len; i++) {
        if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y))
          ins = i;
      }
      if (ins != -1) {
        let inp = document.getElementById("changeColor");
        manager.items[ins].setColor(stringToColorList(inp.value));
        manager.render();
      }
    }
  };
  var deleteEvent = {
    click: function click() {
      let len = manager.items.length;
      let ins = -1;
      for (let i = 0; i < len; i++) {
        if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y))
          ins = i;
      }
      if (ins != -1) {
        manager.deleteItem(ins);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        manager.render();
      }
    }
  };
  var stateEvent = {
    nothing: {},
    draw: drawEvent,
    "draw-square": drawSquareEvent,
    select: selectEvent,
    move: moveEvent,
    resize: resizeEvent,
    "change-color": changeColorEvent,
    delete: deleteEvent
  };
  function clearCanvasStateEventListener() {
    for (const st in stateEvent) {
      for (const evLast in stateEvent[st]) {
        canvas.removeEventListener(evLast, stateEvent[st][evLast]);
      }
    }
    cadState.state = "nothing";
    cadState.bufferItem = [];
    cadState.lastSelect = -1;
    cadState.drawSquare = false;
    let inp = document.getElementById("select-changeColor-child");
    inp.style.display = "none";
    document.getElementById("draw-child").style.display = "none";
    document.getElementById("select-child").style.display = "none";
  }
  const buttonDraw = document.getElementById("draw-button");
  buttonDraw.addEventListener("click", () => {
    clearCanvasStateEventListener();
    cadState.state = "draw";
    for (const evCur in stateEvent[cadState.state]) {
      canvas.addEventListener(evCur, stateEvent[cadState.state][evCur]);
    }
    let button = document.getElementById("draw-child");
    button.style.display = "block";
    document.getElementById("select-child").style.display = "none";
  });
  const buttonDrawDone = document.getElementById("draw-done");
  buttonDrawDone.addEventListener("click", () => {
    let verts = [];
    let cols = [1, 0, 0, 1];
    for (const obj of cadState.bufferItem) {
      verts.push(obj.pos[0]);
      verts.push(obj.pos[1]);
    }
    cadState.bufferItem = [];
    let item = new MapItem(gl, shaderProgram);
    item.createItem(verts, cols);
    manager.push(item);
    manager.render();
  });
  const buttonDrawCancel = document.getElementById("draw-cancel");
  buttonDrawCancel.addEventListener("click", () => {
    clearCanvasStateEventListener();
    manager.render();
    let button = document.getElementById("draw-child");
    button.style.display = "none";
  });
  const buttonDrawSquare = document.getElementById("draw-square-button");
  buttonDrawSquare.addEventListener("click", () => {
    clearCanvasStateEventListener();
    cadState.state = "draw-square";
    for (const evCur in stateEvent[cadState.state]) {
      canvas.addEventListener(evCur, stateEvent[cadState.state][evCur]);
    }
  });
  const buttonSelect = document.getElementById("select-button");
  buttonSelect.addEventListener("click", () => {
    clearCanvasStateEventListener();
    manager.render();
    cadState.state = "select";
    for (const evCur in stateEvent[cadState.state]) {
      canvas.addEventListener(evCur, stateEvent[cadState.state][evCur]);
    }
    let button = document.getElementById("select-child");
    button.style.display = "block";
    document.getElementById("draw-child").style.display = "none";
  });
  const buttonSelectMove = document.getElementById("select-move");
  buttonSelectMove.addEventListener("click", () => {
    cadState.state = "move";
    for (const evCur in stateEvent[cadState.state]) {
      canvas.addEventListener(evCur, stateEvent[cadState.state][evCur]);
    }
    let button = document.getElementById("select-child");
    button.style.display = "none";
  });
  const buttonSelectResize = document.getElementById("select-resize");
  buttonSelectResize.addEventListener("click", () => {
    cadState.state = "resize";
    for (const evCur in stateEvent[cadState.state]) {
      canvas.addEventListener(evCur, stateEvent[cadState.state][evCur]);
    }
    let button = document.getElementById("select-child");
    button.style.display = "none";
  });
  const buttonSelectChangeColor = document.getElementById("select-changeColor");
  buttonSelectChangeColor.addEventListener("click", () => {
    cadState.state = "change-color";
    for (const evCur in stateEvent[cadState.state]) {
      canvas.addEventListener(evCur, stateEvent[cadState.state][evCur]);
    }
    let button = document.getElementById("select-child");
    button.style.display = "none";
    let inp = document.getElementById("select-changeColor-child");
    inp.style.display = "block";
  });
  const buttonDelete = document.getElementById("delete-button");
  buttonDelete.addEventListener("click", () => {
    clearCanvasStateEventListener();
    cadState.state = "delete";
    for (const evCur in stateEvent[cadState.state]) {
      canvas.addEventListener(evCur, stateEvent[cadState.state][evCur]);
    }
  });
  const buttonSave = document.getElementById("save-button");
  buttonSave.addEventListener("click", () => {
    saveProject();
  });
  const buttonLoad = document.getElementById("load-button");
  buttonLoad.addEventListener("click", () => {
    if (document.getElementById("myfile").files.length > 0) {
      loadFile();
    }
  });
}
main();
