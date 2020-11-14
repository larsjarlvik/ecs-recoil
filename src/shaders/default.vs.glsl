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
out vec3 vertNormal;
out vec4 vertTangent;
out vec2 vertUv;

void main(void) {
    vec3 normalW = normalize(vec3(data.transform * vec4(aNormal.xyz, 0.0)));
    vec3 tangentW = normalize(vec3(data.transform * vec4(aTangent.xyz, 0.0)));

    vertPosition = data.transform * vec4(aVertex, 1.0);
    vertNormal = normalW;
    vertTangent = vec4(tangentW, aTangent.w);
    vertUv = aUv;

    gl_Position = data.projection * data.modelView * vertPosition;
}
