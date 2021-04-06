#pragma glslify:RGBShift=require(../../modules/RGBShift)
#pragma glslify:random=require(glsl-random)
#pragma glslify:snoise3=require(glsl-noise/simplex/3d)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    vec4 color=texture2D(tDiffuse,newUv);
    gl_FragColor=color;
}