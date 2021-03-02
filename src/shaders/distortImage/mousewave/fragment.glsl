uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vNoise;

void main(){
    vec2 newUv=vUv;
    vec4 oceanTexture=texture2D(uTexture,newUv);
    vec3 color=oceanTexture.rgb;
    color.rgb+=.1*vNoise;
    gl_FragColor=vec4(color,1.);
}