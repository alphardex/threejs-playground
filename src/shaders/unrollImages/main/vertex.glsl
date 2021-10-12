#pragma glslify:rotate=require(glsl-rotate)
#pragma glslify:PI=require(glsl-constants/PI)

uniform float uProgress;
uniform float uAngle;

varying vec2 vUv;
varying vec3 vPosition;

varying float vFrontShadow;

void main(){
    vec3 newPos=position;
    
    float rad=.1;
    float rolls=8.;
    // rot
    newPos=rotate(newPos-vec3(-.5,.5,0.),vec3(0.,0.,1.),-uAngle)+vec3(-.5,.5,0.);
    
    float offs=(newPos.x+.5)/(sin(uAngle)+cos(uAngle));// -0.5..0.5 -> 0..1
    float tProgress=clamp((uProgress-offs*.99)/.01,0.,1.);
    
    // shadows
    vFrontShadow=clamp((uProgress-offs*.95)/.05,.7,1.);
    
    newPos.z=rad+rad*(1.-offs/2.)*sin(-offs*rolls*PI-.5*PI);
    newPos.x=-.5+rad*(1.-offs/2.)*cos(-offs*rolls*PI+.5*PI);
    // // rot back
    newPos=rotate(newPos-vec3(-.5,.5,0.),vec3(0.,0.,1.),uAngle)+vec3(-.5,.5,0.);
    // unroll
    newPos=rotate(newPos-vec3(-.5,.5,rad),vec3(sin(uAngle),cos(uAngle),0.),-PI*uProgress*rolls);
    newPos+=vec3(
        -.5+uProgress*cos(uAngle)*(sin(uAngle)+cos(uAngle)),
        .5-uProgress*sin(uAngle)*(sin(uAngle)+cos(uAngle)),
        rad*(1.-uProgress/2.)
    );
    
    // animation
    vec3 finalposition=mix(newPos,position,tProgress);
    
    vec4 modelPosition=modelMatrix*vec4(finalposition,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
}