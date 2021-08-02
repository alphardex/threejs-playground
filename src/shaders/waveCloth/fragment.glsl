#pragma glslify:computeNormal=require(../modules/computeNormal)
#pragma glslify:fresnel=require(../modules/fresnel)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    // color
    vec3 color=vec3(1.);
    
    // alpha
    vec3 cNormal=computeNormal(vPosition);
    vec3 up=vec3(0.,0.,-1.);
    float F=fresnel(0.,.5,4.,up,cNormal);
    float alpha=F*.5;
    
    gl_FragColor=vec4(color,alpha);
}