#pragma glslify:snoise3=require(glsl-noise/simplex/3d)
#pragma glslify:PI=require(glsl-constants/PI)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uSpikeLength;

varying vec2 vUv;
varying vec3 vPosition;
varying float vNoise;

void main(){
    float strength=snoise3(vec3(vUv*7.,uTime*.02))*.5+.5;
    vec3 color=mix(uColor1,uColor2,strength);
    float sine=sin(vUv.x*PI);
    float darkness=vNoise/uSpikeLength+1.;
    color*=(sine*.6+.4)*darkness;
    gl_FragColor=vec4(color,1.);
}