#version 100
precision mediump float;

attribute vec3 aVertex;

uniform vec2 uResolution;

varying vec2 fragCoord;
varying vec2 resolution;

void main(void) {
    fragCoord = (aVertex.xy + 1.0) * 0.5;
    resolution = 1.0 / uResolution;

    gl_Position = vec4(aVertex, 1.0);
}
