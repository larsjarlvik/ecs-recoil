#version 300 es
precision mediump float;

in vec4 vertPosition;
in vec3 vertNormal;
in mat3 vertTangent;
in vec2 vertUv;

uniform sampler2D uBaseColor;
uniform sampler2D uNormalMap;

layout(location = 0) out vec4 fragPosition;
layout(location = 1) out vec3 fragNormal;
layout(location = 2) out vec4 fragBaseColor;

void main(void) {
    ivec2 normalSize = textureSize(uNormalMap, 0);
    vec3 normal = vertNormal;
    if (normalSize.x == 1 && normalSize.y == 1) {
        normal = texture(uNormalMap, vertUv).rgb;
        normal = normalize(vertTangent * (2.0 * normal - 1.0));
    }

    fragPosition = vertPosition;
    fragNormal = normal;
    fragBaseColor = texture(uBaseColor, vertUv);
}
