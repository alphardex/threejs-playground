uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uRefractionStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;

// https://community.khronos.org/t/getting-the-normal-with-dfdx-and-dfdy/70177
vec3 computeNormal(vec3 normal){
    vec3 X=dFdx(normal);
    vec3 Y=dFdy(normal);
    vec3 cNormal=normalize(cross(X,Y));
    return cNormal;
}

// http://glslsandbox.com/e#47182.0
vec2 hash22(vec2 p){
    p=fract(p*vec2(5.3983,5.4427));
    p+=dot(p.yx,p.xy+vec2(21.5351,14.3137));
    return fract(vec2(p.x*p.y*95.4337,p.x*p.y*97.597));
}

// https://www.shadertoy.com/view/4scSW4
float fresnel(float bias,float scale,float power,vec3 I,vec3 N)
{
    return bias+scale*pow(1.+dot(I,N),power);
}

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
    color*=(1.-F);
    gl_FragColor=color;
}