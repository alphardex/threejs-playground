varying vec2 vUv;
varying vec3 vPosition;

uniform vec2 uResolution;
uniform float uProgress;

float transition(vec2 st,float progress){
    vec2 p=2.*st-1.;
    float l=pow(length(p)/2.,.5)/sqrt(2.);
    float r=smoothstep(l-.04,l+.04,progress);
    return r;
}

void main(){
    vec3 newPos=position;
    float scale=800.;
    newPos.z+=uProgress*scale*(transition(uv,uProgress)-uProgress);
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
}