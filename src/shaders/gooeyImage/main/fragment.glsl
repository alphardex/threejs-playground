#pragma glslify:centerUv=require(../../modules/centerUv)
#pragma glslify:snoise=require(glsl-noise/simplex/3d)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

uniform sampler2D uTexture2;
uniform vec2 uHoverUv;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec2 uv=vUv;
    vec4 texture1=texture2D(uTexture,uv);
    vec4 texture2=texture2D(uTexture2,uv);
    vec3 colorA=texture1.rgb;
    vec3 colorB=texture2.rgb;
    
    vec2 cUv=centerUv(vUv,uResolution);
    vec2 cHoverUv=centerUv(uHoverUv,uResolution);
    
    // circle
    float circleShape=1.-distance(cUv,cHoverUv);
    
    // noise
    float uvX=cUv.x+sin(cUv.y+uTime*.1);
    float uvY=cUv.y-uTime*.1;
    vec3 distortedUv=vec3(uvX,uvY,uTime*.1)*8.;
    float noise=snoise(distortedUv)-1.;
    
    // final
    float mask=circleShape*2.5+noise*.5;
    float finalMask=smoothstep(.4,.5,mask);
    vec3 finalColor=mix(colorA,colorB,finalMask);
    // finalColor=vec3(finalMask);
    
    gl_FragColor=vec4(finalColor,1.);
}