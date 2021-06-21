#pragma glslify:RGBShift=require(../../modules/RGBShift)

uniform sampler2D tDiffuse;
uniform float uRGBShiftStrength;

varying vec2 vUv;

void main(){
    vec2 offset=vec2(1.,0.)*uRGBShiftStrength;
    vec2 rUv=vUv+offset;
    vec2 gUv=vUv;
    vec2 bUv=vUv-offset;
    vec4 texture=RGBShift(tDiffuse,rUv,gUv,bUv,0.);
    vec4 color=texture;
    gl_FragColor=color;
}