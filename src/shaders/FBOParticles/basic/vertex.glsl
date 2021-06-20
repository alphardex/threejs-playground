varying vec2 vUv;

uniform sampler2D uPositionTexture;
uniform float uPointSize;

attribute vec2 reference;

void main(){
    vec3 pos=texture2D(uPositionTexture,reference).xyz;
    vec4 modelPosition=modelMatrix*vec4(pos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    gl_PointSize=uPointSize*(1./-viewPosition.z);
    
    vUv=reference;
}