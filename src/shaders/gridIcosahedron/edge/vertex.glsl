#pragma glslify:cnoise=require(glsl-noise/classic/3d)

varying vec2 vUv;
varying vec3 vCenter;

attribute vec3 aCenter;

uniform float uNoiseDensity;

void main(){
    vec3 noise=pow(cnoise(normal),3.)*normal*uNoiseDensity;
    vec3 newPosition=position+noise;
    vec4 modelPosition=modelMatrix*vec4(newPosition,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vCenter=aCenter;
}