// Mapping object inside WebGL
class MapItem {
    gl: WebGL2RenderingContext;
    shader: WebGLProgram;

    vertices: number[];
    colors: number[];
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

    // Translation matrix
    translateItem(delx: number, dely: number){
        this.pos[0] += delx;
        this.pos[1] += dely;
    }

    // Set new coordinates position
    setPosition(newx: number, newy: number){
        this.pos[0] = newx;
        this.pos[1] = newy;
    }

    // Scaling matrix
    scaleItem(kx: number, ky: number){
        let len = this.vertices.length;
        for (let i=0;i<len;i++){
            if (i & 1){
                this.vertices[i] *= ky;
            } else{
                this.vertices[i] *= kx;
            }
        }
    }

    // Scaling matrix
    scaleItem(k: number){
        let len = this.vertices.length;
        for (let i=0;i<len;i++){
            this.vertices[i] *= k;
        }
    }

    // Rotate matrix
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

    // Create and binding buffer data
    bind() {
        const gl = this.gl
        const nbuff = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, nbuff)

        const vert = this.vertices;
        let len = vert.length;
        for (let i=0;i<len;i++){
            vert[i] += this.pos[(i & 1)];
        }
        const forBinding = [];
        let vertid = 0;
        let colid = 0;
        for (let i=0;i<len * 6;i++){
            if (i % 6 < 2){
                forBinding.push(vert[vertid]);
                vertid++;
            } else{
                forBinding.push(this.colors[colid]);
                colid++;
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(forBinding), gl.STATIC_DRAW);
    }

    // Draw defined matrix
    draw(){
        const gl = this.gl
        gl.useProgram(this.shader)
        const vertexPos = gl.getAttribLocation(this.shader, 'a_pos');
        const vertexCol = gl.getAttribLocation(this.shader, 'vertColor');
        const vertexProj = gl.getUniformLocation(this.shader, 'u_proj_mat')

        gl.enableVertexAttribArray(vertexPos);
        gl.enableVertexAttribArray(vertexCol);

        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(vertexCol, 4, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.uniformMatrix3fv(vertexProj, false, this.projectionMatrix);
        
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

export default MapItem;