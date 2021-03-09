uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main(){
    vec4 color=texture2D(tDiffuse,vUv);
    gl_FragColor=color;
}