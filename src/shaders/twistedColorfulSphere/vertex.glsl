#pragma glslify:cnoise=require(glsl-noise/classic/3d)
#pragma glslify:rotateY=require(glsl-rotate/rotateY)

uniform float uTime;
uniform float uSpeed;
uniform float uNoiseStrength;
uniform float uNoiseDensity;
uniform float uAmplitude;
uniform float uFrequency;

varying vec2 vUv;
varying vec3 vNormal;
varying float vNoise;

void main(){
    float displacement=uTime*uSpeed;
    float noise=cnoise((normal+displacement)*uNoiseDensity)*uNoiseStrength;
    vec3 newPos=position+(normal*noise);
    float angle=uAmplitude*sin(uFrequency*uv.y+uTime);
    newPos=rotateY(newPos,angle);
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vNormal=normal;
    vNoise=noise;
}