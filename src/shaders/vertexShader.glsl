precision mediump float;

attribute vec2 a_pos;
uniform mat3 u_proj_mat;
uniform vec2 u_resolution;

void main() {
    vec2 position = (u_proj_mat * vec3(a_pos, 1)).xy;
    vec2 mapped = (position / u_resolution) * 2.0 - 1.0; // convert to -1.0 -- 1.0 range
    gl_Position = vec4(mapped, 0, 1);
    gl_PointSize = 7.0;
}