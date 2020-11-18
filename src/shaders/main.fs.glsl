#version 300 es
precision mediump float;

#define LIGHT_INTENSITY 4.0
#define LIGHT_DIRECTION vec3(0.7, -0.7, -1.0)
#define LIGHT_COLOR vec3(1.0)
#define MAX_LIGHTS 10
#define M_PI 3.141592653589793

uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;
uniform sampler2D uDepthBuffer;
uniform sampler2D uBaseColor;

struct Light {
    vec3 position;
    float range;
    vec3 color;
    float intensity;
};

uniform uData {
    vec3 eyePosition;
    float lightCount;
    Light lights[MAX_LIGHTS];
} data;

out vec4 fragColor;

uniform sampler2D uBrdfLut;
uniform samplerCube uEnvironmentDiffuse;
uniform samplerCube uEnvironmentSpecular;

struct MaterialInfo {
    vec3 reflectance0;
    float alphaRoughness;
    vec3 diffuseColor;
    vec3 specularColor;
    vec3 reflectance90;
    float perceptualRoughness;
};

vec3 linearToSrgb(vec3 color) {
    return pow(color, vec3(1.0 / 2.2));
}

vec4 srgbToLinear(vec4 srgbIn) {
    return vec4(pow(srgbIn.xyz, vec3(2.2)), srgbIn.w);
}

vec3 specularReflection(MaterialInfo materialInfo, float VdotH) {
    return materialInfo.reflectance0 + (materialInfo.reflectance90 - materialInfo.reflectance0) * pow(clamp(1.0 - VdotH, 0.0, 1.0), 5.0);
}

float microfacetDistribution(MaterialInfo materialInfo, float NdotH) {
    float alphaRoughnessSq = materialInfo.alphaRoughness * materialInfo.alphaRoughness;
    float f = (NdotH * alphaRoughnessSq - NdotH) * NdotH + 1.0;
    return alphaRoughnessSq / (M_PI * f * f);
}

vec3 calculateLight(MaterialInfo materialInfo, vec3 normal, vec3 view, vec3 pointToLight, float intensity, vec3 color) {
    vec3 n = normalize(normal);           // Outward direction of surface point
    vec3 v = normalize(view);             // Direction from surface point to view
    vec3 l = normalize(pointToLight);     // Direction from surface point to light
    vec3 h = normalize(l + v);            // Direction of the vector between l and v

    float NdotL = clamp(dot(n, l), 0.0, 1.0);
    float NdotH = clamp(dot(n, h), 0.0, 1.0);
    float VdotH = clamp(dot(v, h), 0.0, 1.0);
    float NdotV = clamp(dot(n, v), 0.0, 1.0);

    if (NdotL > 0.0 || NdotV > 0.0) {
        vec3 F = specularReflection(materialInfo, VdotH);
        float D = microfacetDistribution(materialInfo, NdotH);
        vec3 diffuseContrib = (1.0 - F) * (materialInfo.diffuseColor / M_PI);
        vec3 specContrib = F * D;

        return intensity * color * NdotL * (diffuseContrib + specContrib);
    }

    return vec3(0.0);
}

vec3 getIBLContribution(MaterialInfo materialInfo, vec3 n, vec3 v) {
    float NdotV = clamp(dot(n, v), 0.0, 1.0);
    vec2 brdfSamplePoint = clamp(vec2(NdotV, materialInfo.perceptualRoughness), vec2(0.0, 0.0), vec2(1.0, 1.0));

    vec2 brdf = texture(uBrdfLut, brdfSamplePoint).rg;
    vec3 diffuseLight = srgbToLinear(texture(uEnvironmentDiffuse, n)).rgb;
    vec3 specularLight = srgbToLinear(texture(uEnvironmentSpecular, n)).rgb;

    vec3 diffuse = diffuseLight * materialInfo.diffuseColor;
    vec3 specular = specularLight * (materialInfo.specularColor * brdf.x + brdf.y);

    return diffuse + specular;
}

MaterialInfo getMaterialInfo(ivec2 fragCoord) {
    vec3 f0 = vec3(0.04);

    float perceptualRoughness = 0.8;
    float metallic = 1.0;

    vec4 baseColor = srgbToLinear(texelFetch(uBaseColor, fragCoord, 0));
    vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);
    vec3 specularColor = mix(f0, baseColor.rgb, metallic);

    float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);
    vec3 reflectance0 = specularColor.rgb;
    vec3 reflectance90 = vec3(clamp(reflectance * 50.0, 0.0, 1.0));
    float alphaRoughness = perceptualRoughness * perceptualRoughness;

    return MaterialInfo(
        reflectance0,
        alphaRoughness,
        diffuseColor,
        specularColor,
        reflectance90,
        perceptualRoughness
    );
}

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec4 depth = texelFetch(uDepthBuffer, fragCoord, 0);

    if (depth.x == 1.0) {
        discard; return;
    }

    MaterialInfo materialInfo = getMaterialInfo(fragCoord);
    vec3 position = texelFetch(uPositionBuffer, fragCoord, 0).xyz;
    vec3 normal = texelFetch(uNormalBuffer, fragCoord, 0).xyz;

    vec3 view = normalize(data.eyePosition - position);
    vec3 color = calculateLight(materialInfo, normal, view, -LIGHT_DIRECTION, LIGHT_INTENSITY, LIGHT_COLOR);

    for (int i = 0; i < int(data.lightCount); i ++) {
        Light light = data.lights[i];
        float distance = length(light.position - position);
        float attenuation = light.range / (distance * distance);
        float intensity = attenuation * light.intensity;

        color += calculateLight(materialInfo, normal, view, light.position - position, intensity, light.color);
    }

    color += getIBLContribution(materialInfo, normal, view);
    color = clamp(color, 0.0, 1.0);

    fragColor = vec4(linearToSrgb(color), 1.0);
}
