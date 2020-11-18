#version 300 es
precision mediump float;

layout(location = 0) in vec3 aVertex;

uniform vec2 uResolution;

out vec2 resolution;
out vec2 rgbNW;
out vec2 rgbNE;
out vec2 rgbSW;
out vec2 rgbSE;
out vec2 rgbM;

void main(void) {
    vec2 fragCoord = (aVertex.xy + 1.0) * 0.5 * uResolution;
    vec2 inverseVP = 1.0 / uResolution.xy;
    rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
    rgbNE = (fragCoord + vec2( 1.0, -1.0)) * inverseVP;
    rgbSW = (fragCoord + vec2(-1.0,  1.0)) * inverseVP;
    rgbSE = (fragCoord + vec2( 1.0,  1.0)) * inverseVP;
    rgbM = vec2(fragCoord * inverseVP);
    resolution = uResolution;

    gl_Position = vec4(aVertex, 1.0);
}
