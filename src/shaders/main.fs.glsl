#version 300 es
precision highp float;

uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;
uniform sampler2D uUVBuffer;
uniform sampler2D uTextureMap;

out vec4 fragColor;

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec2 uv = texelFetch(uUVBuffer, fragCoord, 0).xy;
    vec4 baseColor = texture(uTextureMap, uv);
    fragColor = baseColor;
}