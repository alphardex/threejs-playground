#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:getRayDirection=require(../modules/getRayDirection)
#pragma glslify:sdSphere=require(glsl-sdf-primitives/sdSphere)
#pragma glslify:cnoise=require(glsl-noise/classic/3d)
#pragma glslify:opU=require(glsl-sdf-ops/union)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uVelocity;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;
varying vec3 vPosition;

float fire(vec3 p){
    vec3 p2=p*vec3(1.,.5,1.)+vec3(0.,1.,0.);
    float d=sdSphere(p2,1.);
    float displacement=uTime*uVelocity;
    vec3 displacementY=vec3(.0,displacement,.0);
    float noise=(cnoise(p+displacementY))*p.y*.4;
    // float result=d;
    float result=d+noise;
    return result;
}

vec2 sdf(vec3 p){
    float result=opU(abs(fire(p)),-(length(p)-100.));
    float objType=1.;
    return vec2(result,objType);
}

vec4 rayMarch(vec3 eye,vec3 ray){
    float depth=0.;
    float strength=0.;
    float eps=.02;
    vec3 pos=eye;
    for(int i=0;i<64;i++){
        pos+=depth*ray;
        float dist=sdf(pos).x;
        depth=dist+eps;
        if(dist>0.){
            strength=float(i)/64.;
        }
    }
    return vec4(pos,strength);
}

void main(){
    vec2 p=centerUv(vUv,uResolution);
    p=p*vec2(1.6,-1);
    
    vec3 ro=vec3(0.,-2.,4.);
    vec3 ta=vec3(0.,-2.5,-1.5);
    float fl=1.25;
    vec3 rd=getRayDirection(p,ro,ta,fl);
    
    vec3 color=vec3(0.);
    
    vec4 result=rayMarch(ro,rd);
    
    float strength=pow(result.w*2.,4.);
    vec3 ellipse=vec3(strength);
    color=ellipse;
    
    float fireBody=result.y/64.;
    vec3 mixColor=mix(uColor1,uColor2,fireBody);
    color*=mixColor;
    
    gl_FragColor=vec4(color,1.);
}