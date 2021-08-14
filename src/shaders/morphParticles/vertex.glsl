varying vec2 vUv;
varying vec3 vPosition;

attribute vec3 aPositionBox;
attribute vec3 aPositionTorus;

uniform float uTransition1;
uniform float uTransition2;

void main(){
    vec3 transition1=mix(position,aPositionBox,uTransition1);
    vec3 transition2=mix(transition1,aPositionTorus,uTransition2);
    vec3 finalPos=transition2;
    vec4 modelPosition=modelMatrix*vec4(finalPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    gl_PointSize=3.;
    
    vUv=uv;
    vPosition=position;
}