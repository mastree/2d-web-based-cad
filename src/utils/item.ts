import { isInsideTrigon, pointToLineDistance, pointToPointDistance } from './geometry'

class MapItem {
    gl: WebGL2RenderingContext;
    shader: WebGLProgram;

    vertices: number[];
    colors: number[]; // length = 4
    pos: number[]; // length = 2

    projectionMatrix: number[];

    constructor(gl: WebGL2RenderingContext, shader: WebGLProgram){
        this.gl = gl;
        this.shader = shader;
        this.pos = [0, 0];
        this.projectionMatrix = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }
    createItem(verts: number[], cols: number[]){
        let minx = verts[0];
        let maxx = verts[0];
        let miny = verts[1];
        let maxy = verts[1];
        let centerx: number;
        let centery: number;

        let len = verts.length;
        for (let i=0;i<len;i++){
            if (i & 1){
                miny = Math.min(miny, verts[i]);
                maxy = Math.max(maxy, verts[i]);
            } else{
                minx = Math.min(minx, verts[i]);
                maxx = Math.max(maxx, verts[i]);
            }
        }
        centerx = (minx + maxx) / 2;
        centery = (miny + maxy) / 2;
        // Create object at origin (0, 0)
        for (let i=0;i<len;i++){
            if (i & 1){
                verts[i] -= centery;
            } else{
                verts[i] -= centerx;
            }
        }
        this.vertices = verts;
        this.colors = cols;
        this.pos = [centerx, centery];
    }
    translateItem(delx: number, dely: number){
        this.pos[0] += delx;
        this.pos[1] += dely;
    }
    setPosition(newx: number, newy: number){
        this.pos[0] = newx;
        this.pos[1] = newy;
    }
    setColor(cols: number[]){
        this.colors = cols;
    }
    scaleItem(k: number){
        let len = this.vertices.length;
        for (let i=0;i<len;i++){
            this.vertices[i] *= k;
        }
    }
    rotateItem(deg: number){
        const rad = deg * Math.PI / 180;
        const sin = Math.sin(rad);
        const cos = Math.cos(rad);
        let len = this.vertices.length;
        for (let i=0;i<len;i+=2){
            let tempx = this.vertices[i];
            let tempy = this.vertices[i + 1];
            this.vertices[i] = tempx * cos + tempy * (-sin);
            this.vertices[i + 1] = tempx * sin + tempy * cos;
        }
    }
    bind() {
        const gl = this.gl
        const nbuff = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, nbuff)

        const vert = [...this.vertices];
        let len = vert.length;
        for (let i=0;i<len;i++){
            vert[i] += this.pos[(i & 1)];
        }
        if (vert.length >= 6){
            for (let i=0;i<4;i++){
                vert.push(vert[i]);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
    }
    draw(){
        const gl = this.gl
        gl.useProgram(this.shader)

        const vertexPos = gl.getAttribLocation(this.shader, 'a_pos');
        const fragCol = gl.getUniformLocation(this.shader, 'u_fragColor');
        const vertexProj = gl.getUniformLocation(this.shader, 'u_proj_mat')
        const u_resolution = gl.getUniformLocation(this.shader, 'u_resolution')

        gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height)
        gl.uniform4fv(fragCol, this.colors)
        gl.uniformMatrix3fv(vertexProj, false, this.projectionMatrix);

        gl.enableVertexAttribArray(vertexPos);
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);

        if (this.vertices.length >= 6){
            for (let i=0;i<this.vertices.length;i+=2){
                gl.drawArrays(gl.TRIANGLES, i / 2, 3);
            }
        } else if (this.vertices.length == 4){
            gl.drawArrays(gl.LINES, 0, 2);
        } else if (this.vertices.length == 2){
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }
    isInside(posX: number, posY: number): boolean{
        const vert = [...this.vertices];
        let len = vert.length;
        for (let i=0;i<len;i++){
            vert[i] += this.pos[(i & 1)];
        }
        if (vert.length >= 6){
            for (let i=0;i<4;i++){
                vert.push(vert[i]);
            }
        }
        if (vert.length >= 6){
            for (let i=0;i<this.vertices.length;i+=2){
                if (isInsideTrigon([posX, posY], vert.slice(i, i + 6))) return true;
            }
        } else if (vert.length == 4){
            if (pointToLineDistance([posX, posY], vert) == 0) return true;
        } else if (vert.length == 2){
            if (pointToPointDistance([posX, posY], vert) == 0) return true;
        }
        return false;
    }
}

export default MapItem;