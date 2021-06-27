#pragma glslify:centerUv=require(../modules/centerUv)
#pragma glslify:snoise=require(glsl-noise/simplex/3d)
#pragma glslify:invert=require(../modules/invert)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uVelocity;
uniform vec3 uSkyColor;

varying vec2 vUv;
varying vec3 vPosition;

#define OCTAVES 6

float fbm(vec3 p){
    float sum=0.;
    float amp=1.;
    for(int i=0;i<OCTAVES;i++){
        vec3 r=p/amp*.2;
        float noise=snoise(r)*amp;
        sum+=noise;
        amp*=.5;
    }
    return sum;
}

void main(){
    vec2 cUv=centerUv(vUv,uResolution);
    vec2 p=cUv;
    vec3 ray=vec3(0.);
    vec3 eye=normalize(vec3(p,2.));
    float displacement=uTime*uVelocity;
    ray.x+=displacement;
    float cloud=0.;
    float sum=0.;
    for(int i=0;i<16;i++){
        ray+=eye;
        sum=fbm(ray);
        sum=clamp(sum,0.,1.)*.1;
        cloud+=sum;
    }
    vec3 color=uSkyColor+cloud;
    gl_FragColor=vec4(color,1.);
}