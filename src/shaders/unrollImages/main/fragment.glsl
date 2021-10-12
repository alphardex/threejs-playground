uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

uniform float uProgress;

varying vec2 vUv;
varying vec3 vPosition;

varying float vFrontShadow;

void main(){
    vec4 texture=texture2D(uTexture,vUv);
    vec3 color=texture.rgb;
    gl_FragColor=vec4(color,1.);
    gl_FragColor.rgb*=vFrontShadow;
    gl_FragColor.a=clamp(uProgress*5.,0.,1.);
}