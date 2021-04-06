#pragma glslify:PI=require(glsl-constants/PI)

uniform float uTime;
uniform vec2 uHoverUv;
uniform float uHoverState;

varying vec2 vUv;

void main(){
    vec3 newPos=position;
    // newPos.x+=10.*sin((newPos.y-1.)/2.*PI+uTime)*sin(uHoverState);
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
}