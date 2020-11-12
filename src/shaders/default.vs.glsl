#version 300 es
precision highp float;

layout(location = 0) in vec3 aVertex;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec4 aTangent;
layout(location = 3) in vec2 aUv;

uniform uData {
    mat4 modelView;
    mat4 projection;
    mat4 transform;
} data;

out vec4 vertPosition;
out mat3 vertTangent;
out vec2 vertUv;

void main(void) {
    vec3 normalW = normalize(vec3(vec4(aNormal.xyz, 0.0)));
    vec3 tangentW = normalize(vec3(data.transform * vec4(aTangent.xyz, 0.0)));
    vec3 bitangentW = cross(normalW, tangentW) * aTangent.w;
    mat3 tangent = mat3(tangentW, bitangentW, normalW);

    vertPosition = data.transform * vec4(aVertex, 1.0);
    vertTangent = tangent;
    vertUv = aUv;

    gl_Position = data.projection * data.modelView * vertPosition;
}
