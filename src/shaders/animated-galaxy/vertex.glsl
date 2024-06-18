uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 color;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    // Defaults
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCentre = length(modelPosition.xz);
    float angleOffet = (1.0 / distanceToCentre) * uTime * 0.6;
    angle += angleOffet;
    modelPosition.x = cos(angle) * distanceToCentre;
    modelPosition.z = sin(angle) * distanceToCentre;

    // Randomness
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    // modelPosition.y += uTime; // TEST
    // modelPosition.x += uTime; // TEST

    gl_Position = projectionPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z); // Mimic Size Attenuation

    // Conversions
    vColor = color;
}
