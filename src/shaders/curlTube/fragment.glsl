#pragma glslify:getScatter=require(../modules/getScatter.glsl)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uSpotLight;
uniform float uScatterDivider;
uniform float uScatterPow;
uniform float uIsTube;
uniform float uIsPlane;
uniform vec3 uPlaneColor;
uniform vec3 uTubeColor;
uniform vec3 uSpotColor;
uniform float uVelocity;
uniform float uTubeThreshold;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main(){
    // scatter
    vec3 cameraToWorld=vWorldPosition-cameraPosition;
    vec3 cameraToWorldDirection=normalize(cameraToWorld);
    float cameraToWorldDistance=length(cameraToWorld);
    float scatter=getScatter(cameraPosition,cameraToWorldDirection,uSpotLight,cameraToWorldDistance,uScatterDivider,uScatterPow);
    
    // color
    vec3 color=vec3(0.,0.,0.);
    if(uIsTube==1.){
        color+=mix(vec3(0.),uTubeColor,scatter);
    }
    if(uIsPlane==1.){
        color+=uPlaneColor;
        color+=mix(vec3(0.),uSpotColor,scatter);
    }
    
    // tube movement
    if(uIsTube==1.){
        float tubeMovement=sin(vUv.x*5.+uTime*uVelocity);
        if(tubeMovement<uTubeThreshold){
            discard;
        }
    }
    
    gl_FragColor=vec4(color,1.);
}