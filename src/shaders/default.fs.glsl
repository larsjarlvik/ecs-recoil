#version 300 es
precision highp float;

in vec4 vertPosition;
in vec3 vertNormal;
in vec4 vertTangent;
in vec2 vertUv;

uniform sampler2D uBaseColor;
uniform sampler2D uNormalMap;

layout(location = 0) out vec4 fragPosition;
layout(location = 1) out vec4 fragNormal;
layout(location = 2) out vec4 fragTangent;
layout(location = 3) out vec4 fragBaseColor;
layout(location = 4) out vec4 fragNormalMap;

void main(void) {
    fragPosition = vertPosition;
    fragNormal = vec4(vertNormal, 0.0);
    fragTangent = vertTangent;
    fragBaseColor = texture(uBaseColor, vertUv);
    fragNormalMap = texture(uNormalMap, vertUv);
}
