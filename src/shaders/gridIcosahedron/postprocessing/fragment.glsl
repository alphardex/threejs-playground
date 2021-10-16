#pragma glslify:hash=require(../../modules/hash)
#pragma glslify:RGBShift=require(../../modules/RGBShift)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uRGBShift;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    
    // RGB扭曲
    vec2 rUv=vUv+vec2(.01)*uRGBShift;
    vec2 gUv=vUv+vec2(0.);
    vec2 bUv=vUv+vec2(.01)*uRGBShift*-1.;
    vec4 color=RGBShift(tDiffuse,rUv,gUv,bUv,1.);
    
    // 噪声背景
    float noise=hash(newUv+uTime)*.15;
    color.rgb+=vec3(noise);
    
    gl_FragColor=color;
}