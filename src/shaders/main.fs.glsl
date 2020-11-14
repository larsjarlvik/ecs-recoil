#version 300 es
precision highp float;

uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;
uniform sampler2D uTangentBuffer;
uniform sampler2D uBaseColor;
uniform sampler2D uNormalMap;

uniform uData {
    vec3 eyePosition;
} data;

out vec4 fragColor;

#define LIGHT_ATTENUATION 10.0
#define LIGHT_POSITION vec3(5.0, 0.0, 5.0)
#define LIGHT_COLOR vec3(0.4)

mat3 getTangentMatrix(ivec2 fragCoord) {
    vec4 normalW = texelFetch(uNormalBuffer, fragCoord, 0);
    vec4 tangentW = texelFetch(uTangentBuffer, fragCoord, 0);
    vec3 bitangentW = cross(normalW.xyz, tangentW.xyz) * tangentW.w;
    return mat3(tangentW, bitangentW, normalW);
}

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec3 position = texelFetch(uPositionBuffer, fragCoord, 0).xyz;
    vec4 baseColor = texelFetch(uBaseColor, fragCoord, 0);
    vec3 normalMap = texelFetch(uNormalMap, fragCoord, 0).xyz;

    mat3 tangent = getTangentMatrix(fragCoord);

    vec3 n = normalize(tangent * normalMap);

    vec3 eyeDirection = normalize(data.eyePosition - position);
    vec3 lightVec = LIGHT_POSITION - position;
    float attenuation = LIGHT_ATTENUATION - length(lightVec);
    vec3 lightDirection = normalize(lightVec);
    vec3 reflectionDirection = reflect(-lightDirection, n);
    vec3 specular = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0) * LIGHT_COLOR;

    float nDotL = max(dot(lightDirection, n), 0.0);
    vec3 diffuse = nDotL * LIGHT_COLOR;
    float ambient = 0.1;
    fragColor = vec4(attenuation * (ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
}