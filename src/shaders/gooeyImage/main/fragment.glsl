#pragma glslify:centerUv=require(../../modules/centerUv)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

uniform float uHoverState;
uniform vec2 uHoverUv;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec4 texture=texture2D(uTexture,vUv);
    vec3 color=texture.rgb;
    
    vec2 cUv=centerUv(vUv,uResolution);
    vec2 cHoverUv=centerUv(uHoverUv,uResolution);
    
    // circle
    float c=1.-distance(cUv,cHoverUv);
    float alpha=uHoverState;
    color=vec3(c*alpha);
    
    gl_FragColor=vec4(color,alpha);
}