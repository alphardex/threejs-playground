#pragma glslify:vnoise=require(../modules/vnoise)

uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

float xmbNoise(vec3 x){
    return cos(x.z*4.)*cos(x.z+uTime/10.+x.x);
}

void main(){
    vec3 p=vec3(position.x,0.,position.y);
    vec3 p2=p;
    vec3 p3=p;
    
    p.y=xmbNoise(p2)/8.;
    
    p3.x-=uTime/5.;
    p3.x/=4.;
    
    p3.y-=uTime/100.;
    p3.z-=uTime/10.;
    
    p.y-=vnoise(p3*7.)/15.+cos(p.x*2.-uTime/2.)/5.-.3;
    p.z-=vnoise(p3*7.)/15.;
    
    vec4 modelPosition=modelMatrix*vec4(p,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=p;
}