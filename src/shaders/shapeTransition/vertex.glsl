#pragma glslify:TWO_PI=require(glsl-constants/TWO_PI)

attribute vec3 aPositionShape2;
attribute vec3 aJitter;

uniform float uTime;
uniform float uChromaticBlur;

void main(){
    float phase=0.;
    phase=.5*(1.+cos(.8*(uTime+uChromaticBlur)+aJitter.x*.1*TWO_PI));
    phase=smoothstep(.1,.9,phase);
    vec3 finalPosition=mix(position,aPositionShape2,phase);
    
    vec4 modelPosition=modelMatrix*vec4(finalPosition,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    gl_PointSize=2.;
}