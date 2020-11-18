#version 300 es
precision mediump float;

in vec4 vertPosition;
in vec3 vertNormal;
in mat3 vertTangent;
in vec2 vertUv;

uniform sampler2D uBaseColor;
uniform sampler2D uNormalMap;
uniform sampler2D uOrm;
uniform uData {
    mat4 modelView;
    mat4 projection;
    mat4 transform;
    float hasNormalMap;
    float hasOrmTexture;
    float metallic;
    float roughness;
} data;

layout(location = 0) out vec4 fragPosition;
layout(location = 1) out vec3 fragNormal;
layout(location = 2) out vec4 fragBaseColor;
layout(location = 3) out vec3 fragOrm;

void main(void) {
    vec3 normal = vertNormal;
    if (data.hasNormalMap == 1.0) {
        normal = texture(uNormalMap, vertUv).rgb;
        normal = normalize(vertTangent * (2.0 * normal - 1.0));
    }

    fragPosition = vertPosition;
    fragNormal = normal;
    fragBaseColor = texture(uBaseColor, vertUv);
    fragOrm = data.hasOrmTexture == 1.0 ? texture(uOrm, vertUv).xyz : vec3(1.0, data.metallic, data.roughness);
}
