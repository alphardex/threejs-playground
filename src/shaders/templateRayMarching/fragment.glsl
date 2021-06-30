#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:getRayDirection=require(../modules/getRayDirection)
#pragma glslify:PI=require(glsl-constants/PI)
#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:sdSphere=require(glsl-sdf-primitives/sdSphere)
#pragma glslify:sdBox=require(glsl-sdf-primitives/sdBox)
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

vec2 sdf(vec3 p){
    float result=sphere(p);
    
    float objType=1.;
    return vec2(result,objType);
}

#pragma glslify:getNormal=require(glsl-sdf-normal,map=sdf)

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
        
        color=vec3(diff);
    }
    gl_FragColor=vec4(color,1.);
}