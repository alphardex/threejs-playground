#pragma glslify:cnoise=require(glsl-noise/classic/3d)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    float area=2.*smoothstep(1.,.8,vUv.y)-1.;
    float noise=.5*(cnoise(vec3(newUv*10.,uTime))+1.);
    float smoothedNoise=smoothstep(.5,.51,noise+area/2.);
    vec4 texture=texture2D(tDiffuse,newUv);
    // vec4 color=vec4(smoothedNoise,0.,0.,1.);
    vec4 color=mix(vec4(1.),texture,smoothedNoise);
    gl_FragColor=color;
}