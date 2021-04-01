#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:sdSphere=require('glsl-sdf-primitives/sdSphere')
#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:SineEggCarton=require(../modules/SineEggCarton)
#pragma glslify:opI=require(glsl-sdf-ops/intersection)
#pragma glslify:invert=require(../modules/invert)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;

const float EPSILON=.0001;
const float PI=3.14159265359;

vec3 sphereColor(vec3 p){
    float amount=clamp((1.5-length(p))/2.,0.,1.);
    vec3 col=.5+.5*cos(6.28319*(vec3(.2,0.,0.)+amount*(3.*.6)*vec3(1.,.9,.8)));
    return col*amount;
}

vec2 sdf(vec3 p){
    float sphere=sdSphere(p,1.);
    float scale=12.;
    float pattern=invert(SineEggCarton(scale*p))/scale;
    float fungus=opI(sphere,pattern);
    float result=fungus;
    float objType=1.;
    return vec2(result,objType);
}

// http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/
// https://gist.github.com/sephirot47/f942b8c252eb7d1b7311
float rayMarch(vec3 eye,vec3 ray,float end,int maxIter){
    float depth=0.;
    for(int i=0;i<maxIter;i++){
        vec3 pos=eye+depth*ray;
        float dist=sdf(pos).x;
        depth+=dist;
        if(dist<EPSILON||dist>=end){
            break;
        }
        gl_FragColor.rgb+=.1*sphereColor(pos);
    }
    return depth;
}

void main(){
    vec2 cUv=centerUv(vUv,uResolution);
    vec3 eye=vec3(0.,0.,8.);
    vec3 ray=normalize(vec3(cUv,-eye.z));
    vec3 color=vec3(0.,0.,0.);
    float end=8.;
    int maxIter=256;
    float depth=rayMarch(eye,ray,end,maxIter);
}