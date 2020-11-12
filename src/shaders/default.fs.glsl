#version 300 es
precision highp float;

in vec4 vColor;
in vec4 vPosition;

layout(location=0) out vec4 fragPosition;
layout(location=1) out vec4 fragNormal;
layout(location=2) out vec4 fragUV;

void main(void) {
    fragPosition = vPosition;
    fragNormal = vec4(0.0);
    fragUV = vColor;
}
