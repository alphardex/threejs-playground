#pragma glslify:map=require(glsl-map)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uProgress;
uniform float uWaveScale;
uniform float uDistA;
uniform float uDistB;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    vec2 p=map(newUv,vec2(0.),vec2(1.),vec2(-1.),vec2(1.));
    
    p+=.1*cos((1.5*uWaveScale)*p.yx+1.1*uTime+vec2(.1,1.1));
    p+=.1*cos((2.3*uWaveScale)*p.yx+1.3*uTime+vec2(3.2,3.4));
    p+=.1*cos((2.2*uWaveScale)*p.yx+1.7*uTime+vec2(1.8,5.2));
    p+=uDistA*cos((uDistB*uWaveScale)*p.yx+1.4*uTime+vec2(6.3,3.9));
    
    float ring=length(p);
    
    float dUvX=mix(vUv.x,ring,uProgress);
    float dUvY=mix(vUv.y,0.,uProgress);
    vec2 distortedUv=vec2(dUvX,dUvY);
    
    vec4 color=texture2D(tDiffuse,distortedUv);
    gl_FragColor=color;
}