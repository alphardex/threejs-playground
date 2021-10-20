uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec3 color=uColor3;
    gl_FragColor=vec4(color,1.);
}