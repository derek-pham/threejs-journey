uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;

#include ./includes/cnoise.glsl;

void main() {
    float outerGlow = distance(vUv, vec2(0.5)) * 6.0 - 1.4;

    vec2 displacedUv = vUv + cnoise(vec3(vUv * 5.0, uTime * 0.1));

    float strength = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));
    strength += outerGlow;
    strength += step(0.3, strength) + 0.3;
    strength = clamp(strength, 0.0, 1.0);

    vec3 color = mix(uColorStart, uColorEnd, strength);

    gl_FragColor = vec4(color, 1.0);

    // #include <colorspace_fragment>
}