#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:sdSphere=require('glsl-sdf-primitives/sdSphere')
#pragma glslify:sdBox=require('glsl-sdf-primitives/sdBox')
#pragma glslify:smin=require(glsl-smooth-min)
#pragma glslify:PI=require(glsl-constants/PI)
#pragma glslify:rotate=require(glsl-rotate)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

vec2 sdf(vec3 p){
    vec3 p1=rotate(p,vec3(1.),uTime);
    float box=sdBox(p1,vec3(.3));
    float result=box;
    float objType=1.;
    return vec2(result,objType);
}

#pragma glslify:getNormal=require('glsl-sdf-normal',map=sdf)

float rayMarch(vec3 eye,vec3 ray,float end){
    float depth=0.;
    for(int i=0;i<256;i++){
        vec3 pos=eye+depth*ray;
        float dist=sdf(pos).x;
        depth+=dist;
        if(dist<.0001||dist>=end){
            break;
        }
    }
    return depth;
}

void main(){
    vec2 cUv=centerUv(vUv,uResolution);
    vec3 color=vec3(0.);
    vec3 eye=vec3(0.,0.,2.5);
    vec3 ray=normalize(vec3(cUv,-eye.z));
    float end=5.;
    float depth=rayMarch(eye,ray,end);
    if(depth<end){
        vec3 pos=eye+depth*ray;
        vec3 normal=getNormal(pos);
        color=normal;
    }
    gl_FragColor=vec4(color,1.);
}