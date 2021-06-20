#pragma glslify:curlNoise=require(../../modules/curlNoise)

uniform sampler2D texturePosition;

uniform float uTime;
uniform float uAmplitude;

void main(){
    
    vec2 uv=gl_FragCoord.xy/resolution.xy;
    vec4 tmpPos=texture2D(texturePosition,uv);
    vec3 position=tmpPos.xyz;
    float freq=1.;
    vec3 p=position*freq+vec3(uTime*.05);
    vec3 noise=curlNoise(p);
    vec3 newPos=position+uAmplitude*noise;
    
    gl_FragColor=vec4(newPos,1.);
}