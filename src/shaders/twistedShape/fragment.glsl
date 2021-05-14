#pragma glslify:fresnel=require(../modules/fresnel)

varying vec3 vNormal;
varying vec3 vEyeVector;

void main(){
    float F=fresnel(0.,.5,2.,vEyeVector,vNormal);
    vec3 bg=vec3(.07,.067,.1647);
    vec3 color=bg+F;
    gl_FragColor=vec4(color,1.);
}