#pragma glslify:snoise=require(glsl-noise/simplex/3d)
#pragma glslify:invert=require(../modules/invert.glsl)
#pragma glslify:readDepth=require(../modules/readDepth.glsl)

uniform float cameraNear;
uniform float cameraFar;
uniform sampler2D uDepth;
uniform float uTime;
uniform float uDepthScale;

varying float vDepth;

attribute float aY;

void main(){
    vec2 newUv=vec2(uv.x,aY);
    float depth=readDepth(uDepth,newUv,cameraNear,cameraFar);
    vec3 pos=position;
    pos.z+=invert(depth)*uDepthScale;
    pos.y+=.01*snoise(vec3(newUv*30.,uTime/2.));
    vec4 modelPosition=modelMatrix*vec4(pos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vDepth=depth;
}