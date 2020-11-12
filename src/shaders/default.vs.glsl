#version 300 es
precision highp float;

layout(location = 0) in vec3 aVertex;
layout(location = 1) in vec3 aNormal;

uniform uData {
    mat4 modelView;
    mat4 projection;
    vec4 color;
    mat4 transform;
} data;

out vec4 vertColor;
out vec4 vertPosition;
out vec4 vertNormal;

void main(void) {
    vertColor = data.color;
    vertPosition = data.modelView * data.transform * vec4(aVertex, 1.0);
    vertNormal = data.transform * vec4(aNormal, 1.0);

    gl_Position = data.projection * vertPosition;
}
