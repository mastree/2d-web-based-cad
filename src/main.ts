import { matrixAdd, matrixMult } from './utils/matrix'
import { fetchShader } from './api/shader'
import MapItem from './utils/item'


var canvas = document.getElementById('Drawing-surface') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;
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
    gl.clearColor(0.9, 0.9, 0.9, 1);
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

    const tri1 = new MapItem(gl, shaderProgram);
    tri1.createItem([0.0, 0.5, -0.5, -0.5, 0.5, -0.5], [1.0, 1.0, 0.0, 1.0, 0.7, 0.0, 1.0, 1.0, 0.1, 1.0, 0.6, 1.0]);
    tri1.scaleItem(0.5);
    tri1.translateItem(0.3, -0.2);
    tri1.rotateItem(45);
    tri1.bind();
    tri1.draw();

    const tri2 = new MapItem(gl, shaderProgram);
    tri2.createItem([0.0, 0.5, -0.5, -0.5, 0.5, -0.5], [1.0, 1.0, 0.0, 1.0, 0.7, 0.0, 1.0, 1.0, 0.1, 1.0, 0.6, 1.0]);
    tri2.scaleItem(0.3);
    tri2.translateItem(-0.3, 0.2);
    tri2.rotateItem(-45);
    tri2.bind();
    tri2.draw();
}

main();