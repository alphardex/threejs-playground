uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform samplerCube uNoiseTexture;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec4 color=textureCube(uNoiseTexture,vPosition);
    gl_FragColor=color;
}