uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec4 color=texture2D(uTexture,vUv);
    gl_FragColor=color;
}