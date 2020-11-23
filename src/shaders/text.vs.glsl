#version 300 es
precision mediump float;

layout(location = 0) in vec2 aVertex;
layout(location = 1) in vec2 aTexCoord;

uniform uData {
    float buf;
    float gamma;
    vec4 posAtlas;
    vec4 color;
} data;

uniform mat4 projection;
out vec2 vertTexCoord;
out vec4 vertColor;
out float vertBuffer;
out float vertGamma;

void main() {
    vertTexCoord = aTexCoord / data.posAtlas.zw;
    vertColor = data.color;
    vertBuffer = data.buf;
    vertGamma = data.gamma;

    gl_Position = projection * vec4(data.posAtlas.xy + aVertex, 0.0, 1.0);
}
