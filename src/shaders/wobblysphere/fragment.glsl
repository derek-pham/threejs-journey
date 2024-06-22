// lowp,mediump or highp for precision of float
precision mediump float;

uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vUv;
varying float vWobble;

void main() {
    float colorMix = smoothstep(-1.0, 1.0, vWobble);

    csm_DiffuseColor.rgb = mix(uColorA, uColorB, colorMix);

    // csm_Metalness = step(0.25, vWobble);
    // csm_Roughness = 1.0 - step(0.25, vWobble);

    csm_Roughness = 1.0 - colorMix;
}