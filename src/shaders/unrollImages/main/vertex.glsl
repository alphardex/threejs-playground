#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:PI=require(glsl-constants/PI)

uniform float uProgress;
uniform float uAngle;

varying vec2 vUv;
varying vec3 vPosition;

varying float vFrontShadow;

vec3 unroll(vec3 p,float angle,float progress){
    float rad=.1;
    float rolls=4.;
    
    p=rotate(p-vec3(-.5,.5,0.),vec3(0.,0.,1.),-angle)+vec3(-.5,.5,0.);
    
    float offset=(p.x+.5)/(sin(angle)+cos(angle));
    float finalProgress=clamp((progress-offset*.99)/.01,0.,1.);
    
    p.z=rad+rad*(1.-offset/2.)*sin(-offset*rolls*PI-.5*PI);
    p.x=-.5+rad*(1.-offset/2.)*cos(-offset*rolls*PI+.5*PI);
    
    p=rotate(p-vec3(-.5,.5,0.),vec3(0.,0.,1.),angle)+vec3(-.5,.5,0.);
    
    p=rotate(p-vec3(-.5,.5,rad),vec3(sin(angle),cos(angle),0.),-PI*progress*rolls);
    p+=vec3(
        -.5+progress*cos(angle)*(sin(angle)+cos(angle)),
        .5-progress*sin(angle)*(sin(angle)+cos(angle)),
        rad*(1.-progress/2.)
    );
    
    p=mix(p,position,finalProgress);
    return p;
}

void main(){
    vec3 newPos=position;
    
    vec3 unrolledPos=unroll(newPos,uAngle,uProgress);
    
    vec4 modelPosition=modelMatrix*vec4(unrolledPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
}