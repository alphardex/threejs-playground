uniform vec2 uFrequency;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    
    float elevation=sin(modelPosition.x*uFrequency.x-uTime)*.1;
    elevation+=sin(modelPosition.y*uFrequency.y-uTime)*.1;
    modelPosition.z+=elevation;
    
    vec4 viewPostion=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPostion;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vElevation=elevation;
}