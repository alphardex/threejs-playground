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

// https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
mat4 rotationMatrix(vec3 axis,float angle){
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;
    return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
    0.,0.,0.,1.);
}

vec3 rotate(vec3 v,vec3 axis,float angle){
    mat4 m=rotationMatrix(axis,angle);
    return(m*vec4(v,1.)).xyz;
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
