#version 300 es
precision highp float;

uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;
uniform sampler2D uUVBuffer;
uniform vec3 eyePosition;

out vec4 fragColor;

void main() {
    vec3 lightPosition = vec3(0.0, 0.0, 0.0);
    vec3 lightColor = vec3(1.0);

    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec3 position = texelFetch(uPositionBuffer, fragCoord, 0).xyz;
    vec3 normal = normalize(texelFetch(uNormalBuffer, fragCoord, 0).xyz);
    vec3 uv = texelFetch(uUVBuffer, fragCoord, 0).xyz;
    vec4 baseColor = texelFetch(uUVBuffer, fragCoord, 0);

    vec3 eyeDirection = normalize(eyePosition - position);
    vec3 lightVec = lightPosition.xyz - position;
    float attenuation = 5.0 - length(lightVec);
    vec3 lightDirection = normalize(lightVec);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    vec3 specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0) * lightColor;

    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = nDotL * lightColor;
    float ambient = 0.1;
    fragColor = vec4(attenuation * (ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
}