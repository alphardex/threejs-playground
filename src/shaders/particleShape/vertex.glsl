#pragma glslify:rotation2d=require(glsl-rotate/rotation-2d.glsl)

uniform float uTime;
uniform float uPointSize;
uniform float uVelocity;

varying vec2 vUv;

void main(){
    vec3 newPos=position;
    newPos.xz*=rotation2d(uTime*uVelocity);
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    gl_PointSize=uPointSize;
    
    vUv=uv;
}