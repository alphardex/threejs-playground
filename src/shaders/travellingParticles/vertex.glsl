attribute float aOpacity;

uniform float uSize;

varying float vOpacity;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    gl_PointSize*=(uSize/-viewPosition.z);
    
    vOpacity=aOpacity;
}