import {isInsideTrigon, pointToLineDistance, pointToPointDistance} from "./geometry.js";
class MapItem {
  constructor(gl, shader) {
    this.gl = gl;
    this.shader = shader;
    this.pos = [0, 0];
    this.projectionMatrix = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ];
  }
  createItem(verts, cols) {
    let minx = verts[0];
    let maxx = verts[0];
    let miny = verts[1];
    let maxy = verts[1];
    let centerx;
    let centery;
    let len = verts.length;
    for (let i = 0; i < len; i++) {
      if (i & 1) {
        miny = Math.min(miny, verts[i]);
        maxy = Math.max(maxy, verts[i]);
      } else {
        minx = Math.min(minx, verts[i]);
        maxx = Math.max(maxx, verts[i]);
      }
    }
    centerx = (minx + maxx) / 2;
    centery = (miny + maxy) / 2;
    for (let i = 0; i < len; i++) {
      if (i & 1) {
        verts[i] -= centery;
      } else {
        verts[i] -= centerx;
      }
    }
    this.vertices = verts;
    this.colors = cols;
    this.pos = [centerx, centery];
  }
  translateItem(delx, dely) {
    this.pos[0] += delx;
    this.pos[1] += dely;
  }
  setPosition(newx, newy) {
    this.pos[0] = newx;
    this.pos[1] = newy;
  }
  setColor(cols) {
    this.colors = cols;
  }
  scaleItem(k) {
    let len = this.vertices.length;
    for (let i = 0; i < len; i++) {
      this.vertices[i] *= k;
    }
  }
  rotateItem(deg) {
    const rad = deg * Math.PI / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    let len = this.vertices.length;
    for (let i = 0; i < len; i += 2) {
      let tempx = this.vertices[i];
      let tempy = this.vertices[i + 1];
      this.vertices[i] = tempx * cos + tempy * -sin;
      this.vertices[i + 1] = tempx * sin + tempy * cos;
    }
  }
  getVertForBinding() {
    let vert = [...this.vertices];
    let len = vert.length;
    for (let i = 0; i < len; i++) {
      vert[i] += this.pos[i & 1];
    }
    if (vert.length >= 6) {
      let ctr = [vert[0], vert[1]];
      let sisa = vert.slice(2, len);
      len = sisa.length;
      vert = [];
      for (let i = 0; i < len; i += 2) {
        vert.push(ctr[0]);
        vert.push(ctr[1]);
        vert.push(sisa[i]);
        vert.push(sisa[i + 1]);
        vert.push(sisa[(i + 2) % len]);
        vert.push(sisa[(i + 3) % len]);
      }
    }
    return vert;
  }
  bind() {
    const gl = this.gl;
    const nbuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nbuff);
    const vert = this.getVertForBinding();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
  }
  draw() {
    const gl = this.gl;
    gl.useProgram(this.shader);
    const vertexPos = gl.getAttribLocation(this.shader, "a_pos");
    const fragCol = gl.getUniformLocation(this.shader, "u_fragColor");
    const vertexProj = gl.getUniformLocation(this.shader, "u_proj_mat");
    const u_resolution = gl.getUniformLocation(this.shader, "u_resolution");
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(fragCol, this.colors);
    gl.uniformMatrix3fv(vertexProj, false, this.projectionMatrix);
    gl.enableVertexAttribArray(vertexPos);
    gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
    const vert = this.getVertForBinding();
    if (vert.length >= 6) {
      let len = vert.length / 2;
      for (let i = 0; i < len - 2; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
      }
    } else if (vert.length == 4) {
      gl.drawArrays(gl.LINES, 0, 2);
    } else if (vert.length == 2) {
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }
  isInside(posX, posY) {
    const vert = this.getVertForBinding();
    if (vert.length >= 6) {
      let len = vert.length / 2;
      for (let i = 0; i < len - 2; i += 3) {
        if (isInsideTrigon([posX, posY], vert.slice(i * 2, (i + 3) * 2)))
          return true;
      }
    } else if (vert.length == 4) {
      if (pointToLineDistance([posX, posY], vert) <= 3)
        return true;
    } else if (vert.length == 2) {
      if (pointToPointDistance([posX, posY], vert) <= 3)
        return true;
    }
    return false;
  }
}
export default MapItem;
