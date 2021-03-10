#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:invert=require(../modules/invert.glsl)
#pragma glslify:qinticInOutAbs=require(../modules/qinticInOutAbs.glsl)

uniform vec3 uAxis;
uniform float uTime;
uniform float uVelocity;
uniform float uDistortion;

varying vec3 vNormal;

const float PI=3.14159265359;

void main(){
    vec3 newPos=position;
    float offset=2.*dot(uAxis,position);
    float sDistortion=.01*uDistortion;
    float oDistortion=sDistortion*offset;
    float displacement=uVelocity*uTime;
    float progress=clamp((fract(displacement)-oDistortion)/invert(sDistortion),0.,1.);
    progress=qinticInOutAbs(progress)*PI;
    newPos=rotate(newPos,uAxis,progress);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(newPos,1.);
    
    vec3 newNormal=rotate(normal,uAxis,progress);
    vNormal=normalMatrix*newNormal;
}
