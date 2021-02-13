attribute float aOpacity;

varying float vOpacity;

void main(){
    vec4 mvPosition=modelViewMatrix*vec4(position,1.);
    gl_PointSize=30000./(1.-mvPosition.z);
    gl_Position=projectionMatrix*mvPosition;
    
    vOpacity=aOpacity;
}
