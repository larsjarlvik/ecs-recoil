#version 100
precision mediump float;

#define FXAA_QUALITY_PRESET 39

@import ./includes/fxaa;

uniform sampler2D uColor;

varying vec2 fragCoord;
varying vec2 resolution;

void main(void) {
    gl_FragColor = FxaaPixelShader(
        fragCoord,
        vec4(0.0),
        uColor,
        uColor,
        uColor,
        resolution,
        vec4(0.0),
        vec4(0.0),
        vec4(0.0),
        0.75,
        0.166,
        0.0833,
        0.0,
        0.0,
        0.0,
        vec4(0.0)
    );

    gl_FragColor.a = texture2D(uColor, fragCoord).a;
}
