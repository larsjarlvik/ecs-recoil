#version 300 es
precision highp float;

in vec4 vertPosition;
in vec4 vertNormal;
in vec2 vertUv;

uniform sampler2D uBaseColor;

layout(location = 0) out vec4 fragPosition;
layout(location = 1) out vec4 fragNormal;
layout(location = 2) out vec4 fragBaseColor;

void main(void) {
    fragPosition = vertPosition;
    fragNormal = vertNormal;
    fragBaseColor = texture(uBaseColor, vertUv);
}
