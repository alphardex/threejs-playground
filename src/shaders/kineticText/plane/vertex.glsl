uniform float uTime;
uniform float uVelocity;
uniform float uFrequency;

varying vec2 vUv;
varying vec3 vPosition;
varying float vWave;

void main(){
    vec3 pos=position;
    float displacement=sin((pos.x-pos.y)*uFrequency-uTime*uVelocity);
    pos.z+=displacement;
    vec4 modelPosition=modelMatrix*vec4(pos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=pos;
    vWave=pos.z;
}