uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;

uniform float uWarpedPositionFrequency;
uniform float uWarpedTimeFrequency;
uniform float uWarpedStrength;

varying vec2 vUv;
varying float vWobble;

attribute vec4 tangent;

#include ./includes/simplexNoise4d.glsl;

float getWobble(vec3 position) {
    vec3 warpedPosition = position;
    warpedPosition += simplexNoise4d(vec4(position * uWarpedPositionFrequency, uTime * uWarpedTimeFrequency)) * uWarpedStrength;

    //Wobble
    return simplexNoise4d(vec4(warpedPosition * uPositionFrequency, //xyz
    uTime * uTimeFrequency)) * uStrength;
}

void main() {
    // csm_Position.y += sin(csm_Position.x*5.0)*0.5;
    vec3 bitangent = cross(normal, tangent.xyz);

    // Neighbours positions
    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + bitangent * shift;

    float wobble = getWobble(csm_Position);
    csm_Position += wobble * normal;
    positionA += getWobble(positionA) * normal;
    positionB += getWobble(positionB) * normal;

    // Compute normals
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

    // Varyings
    vUv = uv;
    vWobble = wobble / uStrength;
}