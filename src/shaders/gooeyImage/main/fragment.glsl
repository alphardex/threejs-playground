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
    float alpha=uHoverState;
    
    // circle mask
    float circleShape=1.-distance(cUv,cHoverUv);
    float circleMask=smoothstep(.4,.5,circleShape)*alpha;
    
    // final
    vec3 finalColor=mix(color,vec3(1.),circleMask);
    
    gl_FragColor=vec4(finalColor,1.);
}