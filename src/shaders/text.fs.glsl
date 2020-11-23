#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in vec2 vertTexCoord;
in vec4 vertColor;
in float vertBuffer;
in float vertGamma;

out vec4 fragColor;

void main() {
    float dist = texture(uTexture, vertTexCoord).r;
    float alpha = smoothstep(vertBuffer - vertGamma, vertBuffer + vertGamma, dist);

    fragColor = vec4(vertColor.rgb, alpha * vertColor.a);
}