#pragma glslify:getScatter=require(../modules/getScatter.glsl)
#pragma glslify:fresnel=require(../modules/fresnel)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uSpotLight;
uniform float uScatterDivider;
uniform float uScatterPow;
uniform float uIsPlane;
uniform float uIsText;
uniform vec3 uPlaneColor;
uniform vec3 uSpotColor;
uniform vec3 uTextColor;
uniform float uUseFresnel;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vEyeVector;

void main(){
    vec3 cameraToWorld=vWorldPosition-cameraPosition;
    vec3 cameraToWorldDirection=normalize(cameraToWorld);
    float cameraToWorldDistance=length(cameraToWorld);
    float scatter=getScatter(cameraPosition,cameraToWorldDirection,uSpotLight,cameraToWorldDistance,uScatterDivider,uScatterPow);
    
    vec3 color=vec3(0.,0.,0.);
    
    if(uIsPlane==1.){
        color+=uPlaneColor;
        color+=mix(vec3(0.),uSpotColor,scatter);
    }
    
    if(uIsText==1.){
        color+=mix(vec3(0.),uTextColor,scatter);
        
        if(uUseFresnel==1.){
            float F=fresnel(0.,.5,3.,vEyeVector,vNormal);
            color+=F;
        }
    }
    
    gl_FragColor=vec4(color,1.);
}