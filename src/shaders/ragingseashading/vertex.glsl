uniform float uBigWavesElevation;
uniform float uTime;
uniform float uBigWavesSpeed;
uniform vec2 uBigWavesFrequency;

uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ./includes/perlinClassic3D.glsl

float waveElevation(vec3 postition) {

    float elevation = sin(postition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
        sin(postition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
        uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++) {
        elevation -= abs(perlinClassic3D(vec3(postition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation) / i;
    };

    return elevation;
}

void main() {   
    // Base position   
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float shift = 0.01;
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);

    float elevation = waveElevation(modelPosition.xyz);
    modelPosition.y += elevation;
    modelPositionA.y += waveElevation(modelPositionA);
    modelPositionB.y += waveElevation(modelPositionB);

    // Compute normals
    vec3 toA = normalize(modelPositionA - modelPosition.xyz);
    vec3 toB = normalize(modelPositionB - modelPosition.xyz);
    vec3 computeNormal = cross(toA, toB);

    // Defaults
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    // Conversions
    vElevation = elevation;
    vNormal = computeNormal;
    vPosition = modelPosition.xyz;
}
