// lowp,mediump or highp for precision of float
uniform float uSliceStart;
uniform float uSliceArc;

precision mediump float;

varying vec3 vPosition;

void main() {
    // float uSliceStart = 1.0;
    // float uSliceArc = 1.5;

    float angle = atan(vPosition.y, vPosition.x);
    angle -= uSliceStart;
    angle = mod(angle, PI * 2.0);

    if(angle > 0.0 && angle < uSliceArc)
        discard;

    float csm_Slice;
}