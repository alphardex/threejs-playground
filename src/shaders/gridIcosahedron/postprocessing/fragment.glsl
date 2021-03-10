#pragma glslify:hash=require(../../../shaders/modules/hash)
#pragma glslify:RGBShift=require(../../../shaders/modules/RGBShift)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uRGBShift;

varying vec2 vUv;

void main(){
    float noise=hash(vUv+uTime)*.1;
    vec4 color=RGBShift(tDiffuse,vUv,vec2(.01)*uRGBShift,1.);
    color.rgb+=vec3(noise);
    gl_FragColor=color;
}