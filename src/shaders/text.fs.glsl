#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in vec2 vertTexCoord;
in vec4 vertColor;
in float vertBuffer;
in float vertGamma;

out vec4 fragColor;

void main() {
    vec4 tex = texture(uTexture, vertTexCoord);
    float alpha = smoothstep(vertBuffer - vertGamma, vertBuffer + vertGamma, tex.r);

    fragColor = vec4(tex.rgb, alpha * vertColor.a);
}