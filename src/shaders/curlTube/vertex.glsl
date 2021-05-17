#pragma glslify:getWorldPosition=require(../modules/getWorldPosition)

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
    vNormal=normal;
    vWorldPosition=getWorldPosition(modelMatrix,position).xyz;
}