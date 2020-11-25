#version 300 es
precision mediump float;

layout(location = 0) in vec3 aVertex;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec4 aTangent;
layout(location = 3) in vec2 aUv;
layout(location = 4) in vec3 aTranslation;
layout(location = 5) in vec3 aRotScale;

uniform uData {
    mat4 modelView;
    mat4 projection;
    mat4 transform;
    float hasNormalMap;
    float hasOrmTexture;
    float metallic;
    float roughness;
} data;

out vec4 vertPosition;
out vec3 vertNormal;
out mat3 vertTangent;
out vec2 vertUv;

mat3 rotateY(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

void main(void) {
    mat3 rotationMatrix = rotateY(aRotScale.x);
    vec3 n = normalize(aNormal);
    vec4 t = normalize(aTangent);
    vec3 normalW = normalize(vec3(vec4(n.xyz, 0.0)));
    vec3 tangentW = normalize(vec3(vec4(t.xyz, 0.0)));
    vec3 bitangentW = cross(normalW, tangentW) * t.w;

    vertPosition = vec4(aTranslation + aVertex * rotationMatrix * aRotScale.y, 1.0);
    vertNormal = normalW * rotationMatrix;
    vertTangent = mat3(tangentW, bitangentW, normalW);
    vertUv = aUv;

    gl_Position = data.projection * data.modelView * vertPosition;
}
