#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:snoise=require(glsl-noise/simplex/2d)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

#define OCTAVES 6

float fbm(vec2 p){
    float sum=0.;
    float amp=.5;
    for(int i=0;i<OCTAVES;i++){
        float noise=snoise(p)*amp;
        sum+=noise;
        p*=2.;
        amp*=.5;
    }
    return sum;
}

void main(){
    vec2 cUv=centerUv(vUv,uResolution);
    vec2 p=cUv*3.;
    float noise=fbm(p);
    vec3 color=vec3(noise);
    gl_FragColor=vec4(color,1.);
}