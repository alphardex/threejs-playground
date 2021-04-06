#pragma glslify:deformationCurve=require(../../../modules/deformationCurve)

uniform float uTime;
uniform float uScrollSpeed;

varying vec2 vUv;

void main(){
    vec3 newPos=position;
    newPos=deformationCurve(newPos,uv,vec2(0.,uScrollSpeed*15.));
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
}