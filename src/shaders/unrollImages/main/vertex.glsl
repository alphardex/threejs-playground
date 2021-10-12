#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:PI=require(glsl-constants/PI)

uniform float uProgress;
uniform float uAngle;

varying vec2 vUv;
varying vec3 vPosition;

varying float vFrontShadow;

vec3 unroll(vec3 p){
    return p;
}

void main(){
    vec3 newPos=position;
    
    vec3 unrolledPos=unroll(newPos);
    
    vec3 finalPos=mix(unrolledPos,position,uProgress);
    
    vec4 modelPosition=modelMatrix*vec4(finalPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
}