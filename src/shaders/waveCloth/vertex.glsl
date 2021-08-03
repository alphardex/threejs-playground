#pragma glslify:vnoise=require(../modules/vnoise)

uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

float xmbNoise(vec3 x){
    return cos(x.z*4.)*cos(x.z+uTime/10.+x.x);
}

void main(){
    vec3 p=vec3(position.x,0.,position.y);
    
    // noise wave
    p.y=xmbNoise(p)/8.;
    
    // distort
    vec3 p2=p;
    p2.x-=uTime/5.;
    p2.x/=4.;
    p2.y-=uTime/100.;
    p2.z-=uTime/10.;
    p.y-=vnoise(p2*8.)/12.+cos(p.x*2.-uTime/2.)/5.-.3;
    p.z-=vnoise(p2*8.)/12.;
    
    // vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 modelPosition=modelMatrix*vec4(p,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=p;
}