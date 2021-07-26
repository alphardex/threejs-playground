uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D uTexture;
uniform sampler2D uDepthMap;

void main(){
    vec4 depth=texture2D(uDepthMap,vUv);
    vec2 parallax=uMouse*depth.r*.025;
    vec2 newUv=vUv+parallax;
    vec4 texture=texture2D(uTexture,newUv);
    vec4 color=texture;
    gl_FragColor=color;
}