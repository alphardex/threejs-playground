#pragma glslify:cnoise=require(glsl-noise/classic/3d)
#pragma glslify:getEyeVector=require(../../modules/getEyeVector)

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;

uniform float uNoiseDensity;

void main(){
    // 噪声扭曲顶点
    vec3 noise=pow(cnoise(normal),3.)*normal*uNoiseDensity;
    vec3 newPos=position+noise;
    
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    
    // 获取N和I
    vNormal=normalize(normalMatrix*normal);
    vEyeVector=getEyeVector(modelMatrix,position,cameraPosition);
}