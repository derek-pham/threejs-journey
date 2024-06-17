// Retrieving the uniforms which already exist
uniform mat4 projectionMatrix;

// Apply transformations relative to the camera
uniform mat4 viewMatrix;

// Apply transformations relative to the Mesh
uniform mat4 modelMatrix;

// Retrieving the uFrequency uniform which was created
uniform vec2 uFrequency;

// Retrieving the uFrequency uniform which was created
uniform float uTime;

// Retrieving the position attribute which already exists
in vec3 position;

in vec2 uv;

// Retrieving the aRandom attribute which was created
in float aRandom;

out float vRandom;
out float vTime;
out vec2 vUv;
out float vElevation;

void main() {
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    // vRandom = aRandom;
    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.y += sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    // modelPosition.y += sin(modelPosition.z * uFrequency.y - uTime) * 0.2;

    // float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    // elevation += sin(modelPosition.z * uFrequency.y - uTime) * 0.1;

    // modelPosition.y += elevation;

    // modelPosition.y += uTime;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // vElevation = elevation;
}
