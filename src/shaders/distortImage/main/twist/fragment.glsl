#pragma glslify:RGBShift=require(../../../modules/RGBShift)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uScrollSpeed;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    vec2 rUv=newUv+vec2(.02)*uScrollSpeed/1.;
    vec2 gUv=newUv+vec2(.02)*uScrollSpeed/2.;
    vec2 bUv=newUv+vec2(.02)*uScrollSpeed/4.;
    vec4 texture=RGBShift(uTexture,rUv,gUv,bUv,0.);
    vec3 color=texture.rgb;
    gl_FragColor=vec4(color,1.);
}