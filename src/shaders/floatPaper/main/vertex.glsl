uniform float uTime;
uniform float uFloat;

varying vec2 vUv;
varying vec3 vPosition;

vec3 distort(vec3 p){
    float freq=.25;
    float angle=(uTime*10.+uv.x*20.-uv.y*10.)*freq;
    float amp=uFloat*10.;
    float strength=sin(angle)*amp;
    p.z+=strength;
    return p;
}

void main(){
    vec3 newPos=position;
    vec3 distortedPos=distort(newPos);
    vec4 modelPosition=modelMatrix*vec4(distortedPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
}