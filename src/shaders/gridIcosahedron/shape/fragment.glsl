#pragma glslify:computeNormal=require(../../modules/computeNormal)
#pragma glslify:hash22=require(../../modules/hash22)
#pragma glslify:fresnel=require(../../modules/fresnel)
#pragma glslify:invert=require(../../modules/invert.glsl)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uRefractionStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;

void main(){
    vec3 cNormal=computeNormal(vNormal);
    float diffuse=dot(cNormal,vec3(1.));
    vec2 rand=hash22(vec2(floor(diffuse*10.)));
    vec2 strength=vec2(sign((rand.x-.5))+(rand.x-.5)*.6,sign((rand.y-.5))+(rand.y-.5)*.6);
    vec2 uv=strength*gl_FragCoord.xy/vec2(1000.);
    vec3 refraction=uRefractionStrength*refract(vEyeVector,cNormal,1./3.);
    uv+=refraction.xy;
    vec4 color=texture2D(uTexture,uv);
    float F=fresnel(0.,1.,2.,vEyeVector,cNormal);
    color*=invert(F);
    gl_FragColor=color;
}