#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:PI=require(glsl-constants/PI)

uniform float uProgress;
uniform float uAngle;

varying vec2 vUv;
varying vec3 vPosition;

vec3 unroll(vec3 p,float angle,float progress){
    float rad=.1;
    float rolls=4.;
    vec3 zAxis=vec3(0.,0.,1.);
    vec3 d=vec3(-.5,.5,0.);
    vec3 d2=vec3(-.5,.5,rad);
    float sc=sin(angle)+cos(angle);
    
    p-=d;
    p=rotate(p,zAxis,-angle);
    p+=d;
    
    float offset=(p.x+.5)/sc;
    float finalProgress=clamp((progress-offset*.99)/.01,0.,1.);
    
    p.z=rad+rad*(1.-offset/2.)*sin(-offset*rolls*PI-.5*PI);
    p.x=-.5+rad*(1.-offset/2.)*cos(-offset*rolls*PI+.5*PI);
    
    p-=d;
    p=rotate(p,zAxis,angle);
    p+=d;
    
    p-=d2;
    p=rotate(p,vec3(sin(angle),cos(angle),0.),-PI*progress*rolls);
    p+=vec3(
        -.5+progress*cos(angle)*sc,
        .5-progress*sin(angle)*sc,
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