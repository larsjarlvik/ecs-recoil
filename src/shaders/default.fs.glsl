#version 300 es
precision highp float;

in vec4 vertPosition;
in mat3 vertTangent;
in vec2 vertUv;

uniform sampler2D uBaseColor;
uniform sampler2D uNormalMap;

layout(location = 0) out vec4 fragPosition;
layout(location = 1) out vec4 fragTangent;
layout(location = 2) out vec4 fragBaseColor;
layout(location = 3) out vec4 fragNormalMap;

void main(void) {
    fragPosition = vertPosition;
    fragTangent = vec4(vertTangent);
    fragBaseColor = texture(uBaseColor, vertUv);
    fragNormalMap = texture(uNormalMap, vertUv);
}
