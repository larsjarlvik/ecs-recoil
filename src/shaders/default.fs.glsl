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
    vec4 baseColor = texture(uBaseColor, vertUv);
    if (baseColor.a < 0.5) discard;

    ivec2 normalSize = textureSize(uNormalMap, 0);
    int hasNormals = normalSize.x == 1 && normalSize.y == 1 ? 0 : 1;
    fragPosition = vertPosition;
    fragNormal = vec4(vertNormal, hasNormals);
    fragTangent = vertTangent;
    fragBaseColor = baseColor;
    fragNormalMap = texture(uNormalMap, vertUv);
}
