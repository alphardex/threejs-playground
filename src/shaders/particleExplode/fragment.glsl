uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;

void main(){
    vec3 color=texture2D(uTexture,vUv).rgb;
    gl_FragColor=vec4(color,1.);
}