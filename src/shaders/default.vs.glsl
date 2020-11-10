#version 300 es
precision highp float;

in vec3 vVertex;

uniform uData {
    mat4 modelView;
    mat4 projection;
    vec4 color;
    vec3 position;
};

out vec4 vColor;

void main(void) {
    vColor = color;
    gl_Position = projection * modelView * vec4(position + vVertex, 1.0);
}
