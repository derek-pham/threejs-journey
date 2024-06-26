uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;

attribute float aScale;

void main() {
    // gl_Position = vec4(position, 1.0) * modelViewMatrix * projectionMatrix;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += sin(uTime + modelPosition.x * 100.0) * aScale * 0.1;
    modelPosition.x += sin(uTime + modelPosition.z * 100.0) * aScale * 0.05;
    modelPosition.z += sin(uTime + modelPosition.x * 100.0) * aScale * 0.005;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * uPixelRatio * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);
}
