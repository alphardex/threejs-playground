#pragma glslify:snoise2=require(glsl-noise/simplex/2d)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uXVelocity;
uniform float uYVelocity;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    float noise=snoise2(vec2(vUv.x+uTime*uXVelocity,vUv.y+uTime*uYVelocity));
    vec3 color=mix(uColor1,uColor2,noise);
    gl_FragColor=vec4(color,1.);
}