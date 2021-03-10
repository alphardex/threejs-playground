#pragma glslify:rotate=require(glsl-rotate)

uniform vec3 uAxis;
uniform float uTime;
uniform float uVelocity;
uniform float uDistortion;

// https://stackoverflow.com/questions/47710377/how-to-implement-meshnormalmaterial-in-three-js-by-glsl
varying vec3 vNormal;

const float PI=3.14159265359;

float invert(float n){
    return 1.-n;
}

// https://github.com/glslify/glsl-easings
float qinticInOut(float t){
    return t<.5
    ?+16.*pow(t,5.)
    :-.5*abs(pow(2.*t-2.,5.))+1.;
}

void main(){
    vec3 newPos=position;
    float offset=2.*dot(uAxis,position);
    float sDistortion=.01*uDistortion;
    float oDistortion=sDistortion*offset;
    float displacement=uVelocity*uTime;
    float progress=clamp((fract(displacement)-oDistortion)/invert(sDistortion),0.,1.);
    progress=qinticInOut(progress)*PI;
    newPos=rotate(newPos,uAxis,progress);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(newPos,1.);
    
    vec3 newNormal=rotate(normal,uAxis,progress);
    vNormal=normalMatrix*newNormal;
}
