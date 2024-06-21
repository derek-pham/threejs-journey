// lowp,mediump or highp for precision of float
precision mediump float;

varying vec3 vColor;

void main() {
    vec2 uv = gl_PointCoord;
    float distanceToCentre = length(uv - vec2(0.5));

    if(distanceToCentre > 0.5)
        discard;

    gl_FragColor = vec4(vColor, 1.0);
    #include <tonemapping_fragment> 
    #include <colorspace_fragment>
}