#pragma glslify:fresnel=require(../modules/fresnel)

uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vEyeVector;

void main(){
    float F=fresnel(0.,.6,2.,vEyeVector,vNormal);
    vec3 color=uColor+F;
    gl_FragColor=vec4(color,1.);
}