// lowp,mediump or highp for precision of float
precision mediump float;

uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // Lights
    vec3 light = vec3(0.0, 0.0, 0.0);
    color *= light;
    

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment> 
    #include <colorspace_fragment>
}