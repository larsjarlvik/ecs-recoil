#version 300 es
precision highp float;

in vec3 vVertex;

uniform uData {
    vec4 color;
    vec3 position;
};

out vec4 vColor;

void main(void) {
    vColor = color;
    gl_Position = vec4(position + vVertex, 1.0);
}
