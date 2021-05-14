#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:vnoise=require(../modules/vnoise)
#pragma glslify:cosPalette=require(glsl-cos-palette)

#define OCTAVES 8

uniform float uTime;
uniform float uVelocity;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uBrightness;
uniform vec3 uContrast;
uniform vec3 uOscilation;
uniform vec3 uPhase;

varying vec2 vUv;
varying vec3 vPosition;

float fbm(in vec2 p){
    float sum=0.;
    float amp=.5;
    float scale=1.;
    for(int i=0;i<OCTAVES;i++){
        sum+=vnoise((p-vec2(1.))*scale)*amp;
        amp*=.6;
        scale*=1.9;
    }
    return sum;
}

float wave(in vec2 p){
    float displacement=uTime*uVelocity;
    vec2 aOffset=vec2(sin(displacement*.02),sin(displacement*.1))*8.;
    float a=fbm(p*3.+aOffset);
    vec2 bOffset=vec2(sin(displacement*.1),sin(displacement*.1))*2.;
    float b=fbm((p+a)*.5+bOffset);
    vec2 cOffset=vec2(sin(displacement*-.01),sin(displacement*.1))*4.;
    float c=fbm((p+b)*2.+cOffset);
    return c;
}

void main(){
    vec2 cUv=centerUv(vUv,uResolution);
    float noise=pow(wave(cUv),2.);
    vec3 color=cosPalette(noise,uBrightness,uContrast,uOscilation,uPhase);
    gl_FragColor=vec4(color,1.);
}