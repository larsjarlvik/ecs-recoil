#version 300 es
precision highp float;

uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;
uniform sampler2D uUVBuffer;

out vec4 fragColor;

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec3 position = texelFetch(uPositionBuffer, fragCoord, 0).xyz;
    vec3 normal = texelFetch(uNormalBuffer, fragCoord, 0).xyz;
    vec3 uv = texelFetch(uUVBuffer, fragCoord, 0).xyz;

    fragColor = vec4(normal, 1.0);
}