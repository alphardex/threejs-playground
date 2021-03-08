uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uIntensity;
uniform vec3 uBrightness;
uniform vec3 uContrast;
uniform vec3 uOscilation;
uniform vec3 uPhase;

varying vec2 vUv;
varying vec3 vNormal;
varying float vNoise;

// https://iquilezles.org/www/articles/palettes/palettes.htm
vec3 cosPalette(in float t,in vec3 a,in vec3 b,in vec3 c,in vec3 d)
{
    return a+b*cos(6.28318*(c*t+d));
}

void main(){
    float noise=vNoise*uIntensity;
    vec3 color=cosPalette(noise,uBrightness,uContrast,uOscilation,uPhase);
    gl_FragColor=vec4(color,1.);
}