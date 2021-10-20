#pragma glslify:random=require(glsl-random)

varying vec2 vUv;
varying vec3 vPosition;

varying float vRandColor;
varying float vRandAlpha;

uniform float uSize;

void main(){
    // rand particle color and alpha
    float randColor=random(uv);
    float randAlpha=random(uv+50.);
    
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    
    gl_Position=projectedPosition;
    gl_PointSize=uSize*(1./-viewPosition.z);
    
    vUv=uv;
    vPosition=position;
    vRandColor=randColor;
    vRandAlpha=randAlpha;
}