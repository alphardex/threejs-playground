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
    vec2 newUv=vUv;
    
    // 平滑着色
    vec3 cNormal=computeNormal(vNormal);
    
    // 漫反射
    float diffuse=dot(cNormal,vec3(1.));
    
    // 折射随机度
    vec2 rand=hash22(vec2(floor(diffuse*10.)));
    vec2 strength=vec2(sign((rand.x-.5))+(rand.x-.5)*.6,sign((rand.y-.5))+(rand.y-.5)*.6);
    newUv=strength*gl_FragCoord.xy/vec2(1000.);
    
    // 折射
    vec3 refraction=.3*refract(vEyeVector,cNormal,1./3.);
    newUv+=refraction.xy;
    
    // 材质贴图
    vec4 texture=texture2D(uTexture,newUv);
    vec4 color=texture;
    
    // 菲涅尔反射
    float F=fresnel(0.,1.,2.,vEyeVector,cNormal);
    color*=(1.-F);
    
    gl_FragColor=color;
}