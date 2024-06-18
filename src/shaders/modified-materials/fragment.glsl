// lowp,mediump or highp for precision of float
precision mediump float;

varying vec3 vColor;

void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = step(0.8, strength);
    strength = 1.0 - strength;
    strength = pow(strength,10.0);

    vec3 finalColor = mix(vec3(0.0),vColor, strength);
    gl_FragColor = vec4(finalColor, 2.0);

    #include <colorspace_fragment>
}