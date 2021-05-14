#pragma glslify:getNDC=require(../modules/getNDC)
#pragma glslify:getEyeVector=require(../modules/getEyeVector)

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNdc;
varying vec3 vNormal;
varying vec3 vEyeVector;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vec3 ndc=getNDC();
    
    vUv=uv;
    vPosition=position;
    vNdc=ndc;
    vNormal=normalize(mat3(modelMatrix)*normal);
    vEyeVector=getEyeVector(modelMatrix,position,cameraPosition);
}