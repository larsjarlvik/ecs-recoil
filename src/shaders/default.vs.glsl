#version 300 es
precision mediump float;

layout(location = 0) in vec3 aVertex;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec4 aTangent;
layout(location = 3) in vec2 aUv;

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

void main(void) {
    vec3 n = normalize(aNormal);
    vec4 t = normalize(aTangent);
    vec3 normalW = normalize(vec3(data.transform * vec4(n.xyz, 0.0)));
    vec3 tangentW = normalize(vec3(data.transform * vec4(t.xyz, 0.0)));
    vec3 bitangentW = cross(normalW, tangentW) * t.w;

    vertPosition = data.transform * vec4(aVertex, 1.0);
    vertNormal = normalW;
    vertTangent = mat3(tangentW, bitangentW, normalW);
    vertUv = aUv;

    gl_Position = data.projection * data.modelView * vertPosition;
}
