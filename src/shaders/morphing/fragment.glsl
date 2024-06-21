precision mediump float;

varying vec3 vColor;

void main() {
    vec2 uv = gl_PointCoord; // UV inside particle
    float distanceToCentre = length(uv - 0.5);
    float alpha = 0.05 / distanceToCentre - 0.1;

    gl_FragColor = vec4(vColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}