#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:sdSphere=require('glsl-sdf-primitives/sdSphere')
#pragma glslify:sdBox=require('glsl-sdf-primitives/sdBox')
#pragma glslify:smin=require(glsl-smooth-min)
#pragma glslify:matcap=require(matcap)
#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:fresnel=require(../modules/fresnel)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uVelocityBox;
uniform float uProgress;
uniform float uAngle;
uniform float uDistance;
uniform float uVelocitySphere;
uniform sampler2D uTexture;

varying vec2 vUv;

const float EPSILON=.0001;
const float PI=3.14159265359;

vec3 background(vec2 uv){
    float dist=length(uv-vec2(.5));
    vec3 bg=mix(vec3(.3),vec3(.0),dist);
    return bg;
}

float movingSphere(vec3 p,float shape){
    float rad=uAngle*PI;
    vec3 pos=vec3(cos(rad),sin(rad),0.)*uDistance;
    vec3 displacement=pos*fract(uTime*uVelocitySphere);
    float gotoCenter=sdSphere(p-displacement,.1);
    return smin(shape,gotoCenter,.3);
}

vec2 sdf(vec3 p){
    vec3 p1=rotate(p,vec3(1.),uTime*uVelocityBox);
    float box=sdBox(p1,vec3(.3));
    float sphere=sdSphere(p,.3);
    float sBox=smin(box,sphere,.3);
    float mixedBox=mix(sBox,box,uProgress);
    mixedBox=movingSphere(p,mixedBox);
    float aspect=uResolution.x/uResolution.y;
    vec2 mousePos=uMouse;
    mousePos.x*=aspect;
    float mouseSphere=sdSphere(p-vec3(mousePos,0.),.15);
    float result=smin(mixedBox,mouseSphere,.1);
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
    }
    return depth;
}

#pragma glslify:getNormal=require('glsl-sdf-normal',map=sdf)

void main(){
    vec2 cUv=centerUv(vUv,uResolution);
    vec3 eye=vec3(0.,0.,2.5);
    vec3 ray=normalize(vec3(cUv,-eye.z));
    vec3 bg=background(vUv);
    vec3 color=bg;
    float end=5.;
    int maxIter=256;
    float depth=rayMarch(eye,ray,end,maxIter);
    if(depth<end){
        vec3 pos=eye+depth*ray;
        vec3 normal=getNormal(pos);
        vec2 matcapUv=matcap(ray,normal);
        color=texture2D(uTexture,matcapUv).rgb;
        float F=fresnel(0.,.4,3.2,ray,normal);
        color=mix(color,bg,F);
    }
    gl_FragColor=vec4(color,1.);
}