uniform float uTime;
uniform vec2 uHoverUv;
uniform float uHoverState;

varying vec2 vUv;
varying float vNoise;

void main(){
    vec3 newPos=position;
    float dist=distance(uv,uHoverUv);
    newPos.z+=10.*sin(10.*dist+uTime)*uHoverState;
    float noise=sin(10.*dist-uTime)*uHoverState;
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vNoise=noise;
}