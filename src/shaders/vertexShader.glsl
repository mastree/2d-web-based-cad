precision mediump float;

attribute vec2 a_pos;
attribute vec4 vertColor;
uniform mat3 u_proj_mat;

varying vec4 u_fragColor;
void main() {
    u_fragColor = vertColor;
    vec2 position = (u_proj_mat * vec3(a_pos, 1)).xy;
    gl_Position = vec4(position, 0, 1);
}