precision mediump float;

attribute vec2 a_pos;
attribute vec4 vertColor;
uniform mat3 u_proj_mat;
// uniform vec2 u_resolution;

varying vec4 u_fragColor;
void main() {
    u_fragColor = vertColor;
    vec2 position = (u_proj_mat * vec3(a_pos, 1)).xy;
    // vec2 posOnResolution = position / u_resolution;
    // vec2 posScale = posOnResolution * 2.0;
    // vec2 clipSpace = posScale - 1.0;
    gl_Position = vec4(position, 0, 1);
}