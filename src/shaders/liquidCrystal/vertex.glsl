#pragma glslify:snoise=require(glsl-noise/simplex/3d)
#pragma glslify:PI=require(glsl-constants/PI)
#pragma glslify:getWorldNormal=require(../modules/getWorldNormal)

uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;
varying vec3 vWorldNormal;

vec3 distort(vec3 p){
    vec3 pointDirection=normalize(p);
    vec3 mousePoint=vec3(uMouse,1.);
    vec3 mouseDirection=normalize(mousePoint);
    float mousePointAngle=dot(pointDirection,mouseDirection);
    
    float freq=1.5;
    float t=uTime*100.;
    
    float f=PI*freq;
    float fc=mousePointAngle*f;
    
    vec3 n11=pointDirection*1.5;
    vec3 n12=vec3(uTime)*4.;
    float dist=smoothstep(.4,1.,mousePointAngle);
    float n1a=dist*2.;
    float noise1=snoise(n11+n12)*n1a;
    
    vec3 n21=pointDirection*1.5;
    vec3 n22=vec3(0.,0.,uTime)*2.;
    vec3 n23=vec3(uMouse,0.)*.2;
    float n2a=.8;
    float noise2=snoise(n21+n22+n23)*n2a;
    
    float mouseN1=sin(fc+PI+t);
    float mouseN2=smoothstep(f,f*2.,fc+t);
    float mouseN3=smoothstep(f*2.,f,fc+t);
    float mouseNa=4.;
    float mouseNoise=mouseN1*mouseN2*mouseN3*mouseNa;
    
    float noise=noise1+noise2+mouseNoise;
    vec3 distortion=pointDirection*(noise+length(p));
    return distortion;
}

#pragma glslify:fixNormal=require(../modules/fixNormal,map=distort)

void main(){
    vec3 pos=position;
    pos=distort(pos);
    vec4 modelPosition=modelMatrix*vec4(pos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vec3 distortedNormal=fixNormal(position,pos,normal);
    
    vUv=uv;
    vWorldNormal=getWorldNormal(modelMatrix,distortedNormal).xyz;
}