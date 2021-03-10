#pragma glslify:invert=require(../../modules/invert.glsl)

uniform sampler2D uTexture;
uniform float uTime;
uniform float uVelocity;
uniform float uShadow;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec2 repeat=vec2(12.,12.);
    vec2 repeatedUv=vUv*repeat;
    vec2 displacement=vec2(uTime*uVelocity+vUv.y,0.);
    vec2 uv=fract(repeatedUv+displacement);
    vec3 texture=texture2D(uTexture,uv).rgb;
    // texture*=vec3(uv.x,uv.y,1.);
    float shadow=vPosition.z/uShadow;
    vec3 color=vec3(texture*shadow);
    gl_FragColor=vec4(color,1.);
}