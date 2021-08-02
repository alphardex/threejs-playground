#pragma glslify:computeNormal=require(../modules/computeNormal)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec3 cNormal=computeNormal(vPosition);
    vec3 up=vec3(0.,0.,1.);
    float alpha=1.-dot(cNormal,up);
    alpha=(1.-cos(alpha*alpha));
    alpha*=.5;
    vec3 color=vec3(1.);
    gl_FragColor=vec4(color,alpha);
}