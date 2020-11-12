#version 300 es
precision highp float;

uniform sampler2D uPositionBuffer;
uniform sampler2D uTangentBuffer;
uniform sampler2D uBaseColor;
uniform sampler2D uNormalMap;

uniform uData {
    vec3 eyePosition;
} data;

out vec4 fragColor;

vec3 lightPosition = vec3(5.0, 5.0, 0.0);
vec3 lightColor = vec3(0.7);

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec3 position = texelFetch(uPositionBuffer, fragCoord, 0).xyz;
    vec3 tangent = texelFetch(uTangentBuffer, fragCoord, 0).xyz;
    vec4 baseColor = texelFetch(uBaseColor, fragCoord, 0);
    vec3 normalMap = texelFetch(uNormalMap, fragCoord, 0).xyz;

    vec3 normal = normalize(tangent * (2.0 * normalMap - 1.0));

    vec3 eyeDirection = normalize(data.eyePosition - position);
    vec3 lightVec = lightPosition.xyz - position;
    float attenuation = 10.0 - length(lightVec);
    vec3 lightDirection = normalize(lightVec);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    vec3 specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0) * lightColor;

    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = nDotL * lightColor;
    float ambient = 0.1;
    fragColor = vec4(attenuation * (ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
}