import { matrixAdd, matrixMult } from './utils/matrix'
import { fetchShader } from './api/shader'
import MapItem from './utils/item'
import ItemManager from './utils/itemManager'

function stringToColorList(color: string): number[]{
    const r = parseInt(color.substr(1,2), 16)
    const g = parseInt(color.substr(3,2), 16)
    const b = parseInt(color.substr(5,2), 16)

    return [r / 256, g / 256, b / 256, 1];
}

let cadState = {
    mousePos: {x: 0, y: 0},
    state: "nothing",
    bufferItem: [],
    lastSelect: -1,
    initPos: {x: 0, y: 0},
};

var canvas = document.getElementById('Drawing-surface') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;
canvas.addEventListener('mousemove', (event) => {
    const bound = canvas.getBoundingClientRect()
    const res = {
        x: event.clientX - bound.left,
        y: canvas.height - (event.clientY - bound.top)
    }
    cadState.mousePos = res
}, false)
canvas.addEventListener('click', (event) => {
    const bound = canvas.getBoundingClientRect()
    console.log(cadState.mousePos.x, cadState.mousePos.y);
}, false)
var gl = canvas.getContext('webgl');
if (!gl){
    gl = canvas.getContext('experimental-webgl');
}

async function main() {
    if (!gl) {
        alert('Your browser does not support WebGL');
        return;
    }
    var vert = await fetchShader('vertexShader.glsl')
    var frag = await fetchShader('fragmentShader.glsl')

    gl.viewport(0, 0, canvas.width, canvas.height);
    console.log(canvas.width, canvas.height);
    // gl.clearColor(0.9, 0.9, 0.9, 1);
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
    
    function saveProject(){
        let proj = document.getElementById("projState") as HTMLInputElement;
        proj.value = JSON.stringify(manager);
    }
    function loadFile(){
        let input = document.getElementById("myfile") as HTMLInputElement;
        let files = input.files;
        let f: File = files[0];
        let reader = new FileReader();
        let fileContent = "";
        reader.onload = function(evt) {
            if(evt.target.readyState != 2) return;
            if(evt.target.error) {
                alert('Error while reading file');
                return;
            }
    
            fileContent = evt.target.result;
    
            manager = new ItemManager();
            let nmanager = JSON.parse(fileContent);
            for (const obj of nmanager.items){
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
        'click':
        function click(){
            const bound = canvas.getBoundingClientRect()
            let item = new MapItem(gl, shaderProgram);
            item.createItem([cadState.mousePos.x, cadState.mousePos.y], [1.0, 0.0, 0.0, 1])
            cadState.bufferItem.push(item);
            manager.renderWith(cadState.bufferItem);
        },
    }
    var selectEvent = {
        'click':
        function click(){
            let len = manager.items.length;
            let ins = -1;
            for (let i=0;i<len;i++){
                if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y)) ins = i;
            }
            console.log(ins);
        },
    }
    var moveEvent = {
        'mousedown':
        function onmousedown(){
            let len = manager.items.length;
            let ins = -1;
            for (let i=0;i<len;i++){
                if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y)) ins = i;
            }
            if (ins != -1){
                cadState.initPos.x = cadState.mousePos.x
                cadState.initPos.y = cadState.mousePos.y

                manager.push(manager.items[ins]);
                manager.deleteItem(ins);
                ins = manager.items.length - 1;
            }
            cadState.lastSelect = ins;
        },
        'mouseup':
        function onmouseup(){
            cadState.lastSelect = -1;
        },
        'mousemove':
        function onmove(){
            if (cadState.lastSelect != -1){
                manager.items[cadState.lastSelect].translateItem(cadState.mousePos.x - cadState.initPos.x, cadState.mousePos.y - cadState.initPos.y);
                cadState.initPos = cadState.mousePos;
                manager.render();
            }
        }
    }
    var resizeEvent = {
        'mousedown':
        function onmousedown(){
            let len = manager.items.length;
            let ins = -1;
            for (let i=0;i<len;i++){
                if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y)) ins = i;
            }
            cadState.lastSelect = ins;
            if (ins != -1){
                cadState.initPos.x = cadState.mousePos.x
                cadState.initPos.y = cadState.mousePos.y
            }
        },
        'mouseup':
        function onmouseup(){
            cadState.lastSelect = -1;
        },
        'mousemove':
        function onmove(){
            if (cadState.lastSelect != -1){
                let cx = manager.items[cadState.lastSelect].pos[0];
                let cy = manager.items[cadState.lastSelect].pos[1];
                let initdelx = cadState.initPos.x - cx
                let initdely = cadState.initPos.y - cy
                let curdelx = cadState.mousePos.x - cx
                let curdely = cadState.mousePos.y - cy
                // manager.items[cadState.lastSelect].scaleItem(Math.min(cadState.mousePos.x - cadState.initPos.x, cadState.mousePos.y - cadState.initPos.y));
                // if (Math.abs(curdelx / initdelx) < Math.abs(curdely / initdely)){
                    // manager.items[cadState.lastSelect].scaleItem(curdelx / initdelx);
                // } else{
                manager.items[cadState.lastSelect].scaleItem(curdely / initdely);
                // }
                cadState.initPos = cadState.mousePos;
                manager.render();
            }
        }
    }
    var changeColorEvent = {
        'click':
        function click(){
            let len = manager.items.length;
            let ins = -1;
            for (let i=0;i<len;i++){
                if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y)) ins = i;
            }
            if (ins != -1){
                let inp = document.getElementById("changeColor") as HTMLFormElement;
                manager.items[ins].setColor(stringToColorList(inp.value));
                manager.render();
            }
        }
    }
    var stateEvent = {
        "nothing": {},
        "draw": drawEvent,
        "select": selectEvent,
        "move": moveEvent,
        "resize": resizeEvent,
        "change-color": changeColorEvent
    }
    function clearCanvasStateEventListener(){
        for (const st in stateEvent){
            for (const evLast in stateEvent[st]){
                canvas.removeEventListener(evLast, stateEvent[st][evLast]);
            }
        }
        cadState.state = "nothing";
        cadState.bufferItem = [];
        cadState.lastSelect = -1;

        let inp = document.getElementById("select-changeColor-child") as HTMLDivElement;
        inp.style.display = "none";
    }

    const buttonDraw = document.getElementById("draw-button") as HTMLButtonElement;
    buttonDraw.addEventListener("click", () => {
        clearCanvasStateEventListener();
        cadState.state = "draw";
        for (const evCur in stateEvent[cadState.state]){
            canvas.addEventListener(evCur, stateEvent[cadState.state][evCur])
        }
        
        let button = document.getElementById("draw-child") as HTMLButtonElement;
        button.style.display = "block";
        document.getElementById("select-child").style.display = "none";
    });

    const buttonDrawDone = document.getElementById("draw-done") as HTMLButtonElement;
    buttonDrawDone.addEventListener("click", () => {
        let verts: number[] = [];
        let cols: number[] = [1, 0, 0, 1];
        for (const obj of cadState.bufferItem){
            verts.push(obj.pos[0]);
            verts.push(obj.pos[1]);
        }
        cadState.bufferItem = [];
        let item = new MapItem(gl, shaderProgram);
        item.createItem(verts, cols);
        manager.push(item);
        manager.render();
    });

    const buttonDrawCancel = document.getElementById("draw-cancel") as HTMLButtonElement;
    buttonDrawCancel.addEventListener("click", () => {
        clearCanvasStateEventListener();
        manager.render();
        
        let button = document.getElementById("draw-child") as HTMLButtonElement;
        button.style.display = "none";
    });

    const buttonSelect = document.getElementById("select-button") as HTMLButtonElement;
    buttonSelect.addEventListener("click", () => {
        clearCanvasStateEventListener();
        manager.render();
        cadState.state = "select";
        for (const evCur in stateEvent[cadState.state]){
            canvas.addEventListener(evCur, stateEvent[cadState.state][evCur])
        }
        
        let button = document.getElementById("select-child") as HTMLButtonElement;
        button.style.display = "block";
        document.getElementById("draw-child").style.display = "none";
    });

    const buttonSelectMove = document.getElementById("select-move") as HTMLButtonElement;
    buttonSelectMove.addEventListener("click", () => {
        cadState.state = "move";
        for (const evCur in stateEvent[cadState.state]){
            canvas.addEventListener(evCur, stateEvent[cadState.state][evCur])
        }
        
        let button = document.getElementById("select-child") as HTMLButtonElement;
        button.style.display = "none";
    });

    const buttonSelectResize = document.getElementById("select-resize") as HTMLButtonElement;
    buttonSelectResize.addEventListener("click", () => {
        cadState.state = "resize";
        for (const evCur in stateEvent[cadState.state]){
            canvas.addEventListener(evCur, stateEvent[cadState.state][evCur])
        }
        
        let button = document.getElementById("select-child") as HTMLButtonElement;
        button.style.display = "none";
    });

    const buttonSelectChangeColor = document.getElementById("select-changeColor") as HTMLButtonElement;
    buttonSelectChangeColor.addEventListener("click", () => {
        cadState.state = "change-color";
        for (const evCur in stateEvent[cadState.state]){
            canvas.addEventListener(evCur, stateEvent[cadState.state][evCur])
        }
        let button = document.getElementById("select-child") as HTMLButtonElement;
        button.style.display = "none";
        let inp = document.getElementById("select-changeColor-child") as HTMLDivElement;
        inp.style.display = "block";
    });

    const buttonSave = document.getElementById("save-button") as HTMLButtonElement;
    buttonSave.addEventListener("click", () => {
        saveProject();
    });

    const buttonLoad = document.getElementById("load-button") as HTMLButtonElement;
    buttonLoad.addEventListener("click", () => {
        loadFile();
    });
}
main()