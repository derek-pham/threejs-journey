// lowp,mediump or highp for precision of float
precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vRandom;
varying float vTime;
varying vec2 vUv;
varying float vElevation;

void main() {
    vec4 textureColor = texture2D(uTexture, vUv);

    textureColor.xyz *= vElevation * 2.0 + 1.0;

    // rgba
    // gl_FragColor = vec4(uColor, 1.0);
    // gl_FragColor = textureColor;
    gl_FragColor = vec4(vUv, 1.0,1.0);

}