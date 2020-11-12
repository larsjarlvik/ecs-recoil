#version 300 es
layout(location=0) in vec4 aPosition;

uniform mat4 modelView;
uniform mat4 projection;

void main() {
    gl_Position = aPosition;
}
