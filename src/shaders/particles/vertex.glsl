precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

varying vec3 vColor;

attribute float aIntensity;
attribute float aAngle;

void main() {
    vec3 newPosition = position;
    float pictureIntensity = texture(uPictureTexture, uv).r;
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    vec3 displacement = vec3(cos(aAngle) * 0.6, sin(aAngle) * 0.6, 1.0);
    displacementIntensity = smoothstep(0.1,0.3,displacementIntensity);

    displacement = normalize(displacement);
    displacement *= displacementIntensity;
    displacement *= 1.0;
    displacement *= aIntensity;

    newPosition += displacement;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = 0.045 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / -viewPosition.z);

    // Varyings
    vColor = vec3(pow(pictureIntensity, 2.0));

}
