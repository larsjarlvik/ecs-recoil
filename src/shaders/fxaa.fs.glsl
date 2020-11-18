#version 300 es
precision mediump float;

#define FXAA_REDUCE_MIN (1.0 / 128.0)
#define FXAA_REDUCE_MUL (1.0 / 8.0)
#define FXAA_SPAN_MAX 8.0

uniform sampler2D uColor;

in vec2 resolution;
in vec2 rgbNW;
in vec2 rgbNE;
in vec2 rgbSW;
in vec2 rgbSE;
in vec2 rgbM;

out vec4 fragColor;

void main(void) {
    vec4 color;
    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
    vec3 rgbNW = texture(uColor, rgbNW).xyz;
    vec3 rgbNE = texture(uColor, rgbNE).xyz;
    vec3 rgbSW = texture(uColor, rgbSW).xyz;
    vec3 rgbSE = texture(uColor, rgbSE).xyz;
    vec4 texColor = texture(uColor, rgbM);
    vec3 rgbM = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);

    dir = min(
        vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
        max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
        dir * rcpDirMin
    )) * inverseVP;

    vec3 rgbA = 0.5 * (
        texture(uColor, gl_FragCoord.xy * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
        texture(uColor, gl_FragCoord.xy * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture(uColor, gl_FragCoord.xy * inverseVP + dir * -0.5).xyz +
        texture(uColor, gl_FragCoord.xy * inverseVP + dir *  0.5).xyz);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA, texColor.a);
    else
        color = vec4(rgbB, texColor.a);

    fragColor = color;
}
