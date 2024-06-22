// lowp,mediump or highp for precision of float
precision mediump float;

varying vec3 vColor;

void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    if(distanceToCenter > 0.5)
        discard; // Render each particle fragment into circles
    
    gl_FragColor = vec4(vColor, 1.0);
}