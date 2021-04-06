#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:sdSphere=require('glsl-sdf-primitives/sdSphere')
#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:sineEggCarton=require(../modules/sineEggCarton)
#pragma glslify:opI=require(glsl-sdf-ops/intersection)
#pragma glslify:invert=require(../modules/invert)
#pragma glslify:cosPalette=require(glsl-cos-palette)
#pragma glslify:PI=require(glsl-constants/PI)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uBrightness;
uniform vec3 uContrast;
uniform vec3 uOscilation;
uniform vec3 uPhase;
uniform float uOscilationPower;
uniform float uScale;
uniform float uScaleUv;
uniform float uEye;
uniform float uVelocity;
uniform vec3 uBgColor;

varying vec2 vUv;

vec3 sphereColor(vec3 p){
    float amount=clamp((1.5-length(p))/2.,0.,1.);
    vec3 col=cosPalette(amount,uBrightness,uContrast,uOscilationPower*uOscilation,uPhase);
    return col*amount;
}

vec2 sdf(vec3 p){
    vec3 p1=rotate(p,vec3(0.,1.,1.),2.*uTime*uVelocity);
    float sphere=sdSphere(p1,1.);
    float scale=uScale+sin(.2*uTime);
    float pattern=invert(sineEggCarton(scale*p1))/scale;
    float result=opI(sphere,pattern);
    float objType=1.;
    return vec2(result,objType);
}

float rayMarch(vec3 eye,vec3 ray,float end){
    float depth=0.;
    for(int i=0;i<256;i++){
        vec3 pos=eye+depth*ray;
        float dist=sdf(pos).x;
        depth+=dist;
        if(dist<.0001||dist>=end){
            break;
        }
        gl_FragColor.rgb+=.1*sphereColor(pos);
    }
    return depth;
}

void bgColor(){
    vec3 col=uBgColor;
    gl_FragColor+=vec4(col,1.);
}

void main(){
    bgColor();
    vec2 newUv=vUv;
    newUv.x-=(uMouse.x*.02);
    newUv.y-=(uMouse.y*.02);
    vec2 cUv=centerUv(newUv,uResolution)*uScaleUv;
    vec3 eye=vec3(0.,0.,uEye);
    vec3 ray=normalize(vec3(cUv,-eye.z));
    float end=8.;
    float depth=rayMarch(eye,ray,end);
}