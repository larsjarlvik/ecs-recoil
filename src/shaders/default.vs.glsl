#version 300 es
precision highp float;

layout(location = 0) in vec3 aVertex;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;

uniform uData {
    mat4 modelView;
    mat4 projection;
    mat4 transform;
} data;

out vec4 vertPosition;
out vec4 vertNormal;
out vec2 vertUv;

void main(void) {
    vertPosition = data.transform * vec4(aVertex, 1.0);
    vertNormal = data.transform * vec4(aNormal, 1.0);
    vertUv = aUv;

    gl_Position = data.projection * data.modelView * vertPosition;
}
