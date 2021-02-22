import { matrixAdd, matrixMult } from './utils/matrix'
import { fetchShader } from './api/shader'
import MapItem from './utils/item'
import ItemManager from './utils/itemManager'

let cadState = {
    mousePos: {x: 0, y: 0},
    state: "nothing",
    bufferItem: []
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

    const manager = new ItemManager();
    const tri1 = new MapItem(gl, shaderProgram);
    tri1.createItem([0.0, 0.0, 200.0, 0.0, 0.0, 200.0], [1.0, 0.0, 0.0, 1.0]);
    tri1.translateItem(100, 100);
    tri1.rotateItem(20);
    manager.push(tri1);

    const tri2 = new MapItem(gl, shaderProgram);
    tri2.createItem([200.0, 200.0], [0.0, 1.0, 0.0, 1.0]);
    tri2.scaleItem(0.5);
    tri2.rotateItem(45);
    manager.push(tri2);
    
    const tri3 = new MapItem(gl, shaderProgram);
    tri3.createItem([500.0, 0.0, 0.0, 500.0], [0.0, 0.0, 1.0, 1.0]);
    manager.push(tri3);

    // const tri4 = new MapItem(gl, shaderProgram);
    // tri4.createItem([500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 500.0], [1.0, 0.0, 1.0, 1.0]);
    // manager.push(tri4);

    manager.render();

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
            const bound = canvas.getBoundingClientRect()
            let len = manager.items.length;
            let ins = -1;
            for (let i=0;i<len;i++){
                if (manager.items[i].isInside(cadState.mousePos.x, cadState.mousePos.y)) ins = i;
            }
            console.log(ins);
        },
    }


    // USE THIS FOR draw event listener
    for (let eve in drawEvent){
        canvas.addEventListener(eve, drawEvent[eve]);
    }

    // USE THIS FOR select event listener
    // for (let eve in selectEvent){
    //     canvas.addEventListener(eve, selectEvent[eve]);
    // }
}
main()