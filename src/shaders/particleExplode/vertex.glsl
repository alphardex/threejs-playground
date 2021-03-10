#pragma glslify:curlNoise=require(../modules/curlNoise)

uniform float uTime;
uniform float uProgress;
varying vec2 vUv;

void main(){
    vec3 noise=curlNoise(vec3(position.x*.02,position.y*.008,uTime*.05));
    vec3 distortion=vec3(position.x*2.,position.y,1.)*noise*uProgress;
    vec3 newPos=position+distortion;
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    gl_PointSize=2.;
    
    vUv=uv;
}