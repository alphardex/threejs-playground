#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:getRayDirection=require(../modules/getRayDirection)
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
#pragma glslify:diffuse=require(../modules/diffuse)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

float sphere(vec3 p){
    vec3 p1=p;
    float geo=sdSphere(p1,.6);
    float result=geo;
    return result;
}

float box(vec3 p){
    vec3 p1=p;
    // p1=rotate(p1,vec3(1.),uTime);
    // p1=opRep(p1,vec3(2.5));
    float geo=sdBox(p1,vec3(.6));
    float result=geo;
    return result;
}

float roundBox(vec3 p){
    vec3 p1=p;
    // p1=opRep(p1,vec3(2.5));
    float geo=sdRoundBox(p1,vec3(.54),.06);
    float result=geo;
    return result;
}

float torusAndPlaneUnion(vec3 p){
    p=rotate(p,vec3(1.,0.,0.),45.);
    vec3 p1=p;
    vec3 p2=p;
    // p1=rotate(p1,vec3(1.,0.,0.),uTime);
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
    float geo1=sdRoundBox(p1,vec3(1.,.2,.2),.1);
    float geo2=sdTorus(p1,vec2(.6,.2));
    float result=opS(geo2,geo1);
    return result;
}

float boxAndTorusAndCylinderSmin(vec3 p){
    p=rotate(p,vec3(1.),uTime);
    // p=opTwist(p,sin(uTime)*8.);
    vec3 p1=p;
    vec3 p2=p;
    vec3 p3=p;
    float geo1=sdRoundBox(p1,vec3(1.,.2,.2),.1);
    float geo2=sdTorus(p1,vec2(.6,.2));
    float geo3=sdCappedCylinder(p3,vec2(.3,.3));
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
    vec2 p=centerUv(vUv,uResolution);
    
    vec3 ro=vec3(0.,0.,8.);// ray origin
    vec3 ta=vec3(0.,0.,0.);// look-at target
    float fl=2.5;// focal length
    vec3 rd=getRayDirection(p,ro,ta,fl);
    
    vec3 color=vec3(0.);
    
    float end=24.;
    float depth=rayMarch(ro,rd,end);
    if(depth<end){
        vec3 pos=ro+depth*rd;
        vec3 normal=getNormal(pos);
        
        // diffuse
        vec3 lightDir=vec3(-.5,.5,.5);
        float diff=diffuse(lightDir,normal,2.);
        
        // tile
        float u=1.-floor(mod(pos.x,2.));
        float v=1.-floor(mod(pos.z,2.));
        if((u==1.&&v<1.)||(u<1.&&v==1.)){
            diff*=.7;
        }
        
        // softshadow
        float shadow=softshadow(pos,lightDir,.02,2.5);
        diff*=shadow;
        
        color=vec3(diff);
    }
    gl_FragColor=vec4(color,1.);
}