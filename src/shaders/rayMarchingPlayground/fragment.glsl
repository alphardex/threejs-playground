#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:PI=require(glsl-constants/PI)
#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:sdSphere=require(glsl-sdf-primitives/sdSphere)
#pragma glslify:sdBox=require(glsl-sdf-primitives/sdBox)
#pragma glslify:sdRoundBox=require(../modules/sdRoundBox)
#pragma glslify:sdTorus=require(glsl-sdf-primitives/sdTorus)
#pragma glslify:sdPlane=require(glsl-sdf-primitives/sdPlane)
#pragma glslify:sdCappedCylinder=require(glsl-sdf-primitives/sdCappedCylinder)
#pragma glslify:smin=require(glsl-smooth-min)
#pragma glslify:opRep=require(glsl-sdf-ops/repeat)
#pragma glslify:opI=require(glsl-sdf-ops/intersection)
#pragma glslify:opS=require(glsl-sdf-ops/subtraction)
#pragma glslify:opU=require(glsl-sdf-ops/union)
#pragma glslify:opTwist=require(../modules/twist)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

float sphere(vec3 p){
    vec3 p1=p;
    float geo=sdSphere(p1,.1);
    float result=geo;
    return result;
}

float box(vec3 p){
    vec3 p1=p;
    // p1=rotate(p1,vec3(1.),uTime);
    // p1=opRep(p1,vec3(.5));
    float geo=sdBox(p1,vec3(.1));
    float result=geo;
    return result;
}

float roundBox(vec3 p){
    vec3 p1=p;
    // p1=opRep(p1,vec3(.5));
    float geo=sdRoundBox(p1,vec3(.05),.05);
    float result=geo;
    return result;
}

float torusAndPlaneUnion(vec3 p){
    p=rotate(p,vec3(1.,0.,0.),45.);
    vec3 p1=p;
    vec3 p2=p;
    // p1=rotate(p1,vec3(1.),uTime);
    p1.y+=.1;
    p2.y-=.3;
    float geo1=sdTorus(p1,vec2(.6,.2));
    float geo2=sdPlane(p2,vec4(vec3(0.,1.,0.),.5));
    float result=opU(geo1,geo2);
    return result;
}

float boxAndTorusSubtraction(vec3 p){
    p=rotate(p,vec3(1.),uTime);
    vec3 p1=p;
    vec3 p2=p;
    float geo1=sdRoundBox(p1,vec3(.5,.1,.1),.05);
    float geo2=sdTorus(p1,vec2(.36,.12));
    float result=opS(geo2,geo1);
    return result;
}

float boxAndTorusAndCylinderSmin(vec3 p){
    p=rotate(p,vec3(1.),uTime);
    // p=opTwist(p,sin(uTime)*8.);
    vec3 p1=p;
    vec3 p2=p;
    vec3 p3=p;
    float geo1=sdRoundBox(p1,vec3(.5,.1,.1),.05);
    float geo2=sdTorus(p2,vec2(.36,.12));
    float geo3=sdCappedCylinder(p3,vec2(.15,.15));
    float result=smin(smin(geo2,geo1,.05),geo3,.05);
    return result;
}

vec2 sdf(vec3 p){
    // float result=sphere(p);
    // float result=box(p);
    // float result=roundBox(p);
    float result=torusAndPlaneUnion(p);
    // float result=boxAndTorusSubtraction(p);
    // float result=boxAndTorusAndCylinderSmin(p);
    
    float objType=1.;
    return vec2(result,objType);
}

#pragma glslify:getNormal=require(glsl-sdf-normal,map=sdf)
#pragma glslify:softshadow=require(glsl-sdf-ops/softshadow,map=sdf)

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
    vec3 eye=vec3(0.,0.,1.);
    vec3 ray=normalize(vec3(cUv,-eye.z));
    float end=24.;
    float depth=rayMarch(eye,ray,end);
    if(depth<end){
        vec3 pos=eye+depth*ray;
        vec3 normal=getNormal(pos);
        
        // diffuse
        vec3 lightDir=vec3(-.5,.5,.5);
        float diffuse=max(dot(lightDir,normal),.1);
        
        // tile
        float u=1.-floor(mod(pos.x,2.));
        float v=1.-floor(mod(pos.z,2.));
        if((u==1.&&v<1.)||(u<1.&&v==1.)){
            diffuse*=.7;
        }
        
        // softshadow
        float shadow=softshadow(pos,lightDir,.02,2.5);
        diffuse*=shadow;
        
        color=vec3(diffuse);
    }
    gl_FragColor=vec4(color,1.);
}