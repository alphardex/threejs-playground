#pragma glslify:RGBShift=require(../../../modules/RGBShift)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uScrollSpeed;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    vec4 texture=RGBShift(uTexture,newUv,vec2(.05)*uScrollSpeed,0.);
    vec3 color=texture.rgb;
    gl_FragColor=vec4(color,1.);
}