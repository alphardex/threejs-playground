#pragma glslify:edgeFactorTri=require(../../modules/edgeFactorTri)
#pragma glslify:invert=require(../../modules/invert.glsl)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uWidth;

varying vec2 vUv;
varying vec3 vCenter;

void main(){
    float line=invert(edgeFactorTri(vCenter,uWidth));
    if(line<.1){
        discard;
    }
    vec4 color=vec4(vec3(line),1.);
    gl_FragColor=color;
}