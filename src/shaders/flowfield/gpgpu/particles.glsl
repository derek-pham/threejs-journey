// lowp,mediump or highp for precision of float
precision mediump float;

uniform float uTime;
uniform float uDeltaTime;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;
uniform sampler2D uBase;

#include ../includes/simplexNoise4d.glsl;

void main() {
    float time = uTime * 0.2;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    //Dead
    if(particle.a >= 1.0) {
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;
    } else {
        float influence = (uFlowFieldInfluence-0.5) * -2.0;
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
        strength = smoothstep(influence, 1.0, strength);

        //Flow field
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency, time)), 
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)), 
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time)));
        flowField = normalize(flowField);
        particle.xyz += flowField * uDeltaTime * uFlowFieldStrength * strength;

    //Decay
        particle.a += uDeltaTime * 0.3;
    };

    // particle.x +=0.01;
    gl_FragColor = particle;
}