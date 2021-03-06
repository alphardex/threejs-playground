#pragma glslify:map=require(glsl-map)
#pragma glslify:invert=require(../../modules/invert.glsl)

uniform sampler2D uTexture;
uniform float uTime;
uniform float uVelocity;
uniform float uShadow;

varying vec2 vUv;
varying vec3 vPosition;
varying float vWave;

void main(){
    vec2 repeat=vec2(4.,16.);
    vec2 repeatedUv=vUv*repeat;
    vec2 uv=fract(repeatedUv);
    vec3 texture=texture2D(uTexture,uv).rgb;
    // texture*=vec3(uv.x,uv.y,1.);
    float wave=vWave;
    wave=map(wave,-1.,1.,0.,.1);
    float shadow=invert(wave);
    vec3 color=vec3(texture*shadow);
    gl_FragColor=vec4(color,1.);
}