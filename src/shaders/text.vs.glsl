#version 300 es
precision mediump float;

layout(location=0) in vec2 aVertex;
layout(location=1) in vec2 aTexCoord;

uniform mat4 projection;

uniform uData {
    vec4 color;
    float buf;
    float gamma;
} data;

out vec2 vertTexCoord;
out vec4 vertColor;
out float vertBuffer;
out float vertGamma;

void main() {
    vertTexCoord = aTexCoord / vec2(512.0, 1024.0);
    vertColor = data.color;
    vertBuffer = data.buf;
    vertGamma = data.gamma;
    gl_Position = projection * vec4(aVertex.xy, 0.0, 1.0);
}