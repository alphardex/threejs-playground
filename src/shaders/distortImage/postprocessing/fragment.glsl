uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    vec3 color=texture2D(tDiffuse,newUv).rgb;
    gl_FragColor=vec4(color,1.);
}