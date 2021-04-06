#pragma glslify:hash=require(../../modules/hash)
#pragma glslify:RGBShift=require(../../modules/RGBShift)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uRGBShift;

varying vec2 vUv;

void main(){
    float noise=hash(vUv+uTime)*.1;
    vec2 rOffset=vec2(.01)*uRGBShift;
    vec2 gOffset=vec2(0.);
    vec2 bOffset=vec2(.01)*uRGBShift*-1.;
    vec4 color=RGBShift(tDiffuse,vUv,rOffset,gOffset,bOffset,1.);
    color.rgb+=vec3(noise);
    gl_FragColor=color;
}