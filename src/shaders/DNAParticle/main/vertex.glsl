#pragma glslify:random=require(glsl-random)
#pragma glslify:quinticInOut=require(glsl-easings/quintic-in-out)

varying vec2 vUv;
varying vec3 vPosition;

varying float vRandColor;
varying float vRandAlpha;

uniform float uSize;
uniform float uProgress;

void main(){
    // rand particle color and alpha
    float randColor=random(uv);
    float randAlpha=random(uv+50.);
    float randAnimeOffset=random(uv);
    
    vec3 newPos=position;
    
    // anime
    // newPos.y+=quinticInOut(clamp(0.,1.,(uProgress-uv.y*.6)/.4));
    
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    
    gl_Position=projectedPosition;
    gl_PointSize=uSize*(1./-viewPosition.z);
    
    vUv=uv;
    vPosition=position;
    vRandColor=randColor;
    vRandAlpha=randAlpha;
}