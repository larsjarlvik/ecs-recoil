#version 300 es
precision highp float;

in vec4 vertColor;
in vec4 vertPosition;
in vec4 vertNormal;

layout(location = 0) out vec4 fragPosition;
layout(location = 1) out vec4 fragNormal;
layout(location = 2) out vec4 fragUV;

void main(void) {
    fragPosition = vertPosition;
    fragNormal = vertNormal;
    fragUV = vertColor;
}
