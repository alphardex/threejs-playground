#pragma glslify:vnoise=require(../modules/vnoise)
#pragma glslify:map=require(glsl-map)
#pragma glslify:invert=require(../modules/invert)
#pragma glslify:fresnel=require(../modules/fresnel)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uPerlinNoiseTexture;
uniform float uTransitionProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNdc;
varying vec3 vNormal;
varying vec3 vEyeVector;

void main(){
    // stroke
    float light=dot(vNormal,normalize(vec3(1.)));
    float stroke=cos((vNdc.x-vNdc.y)*750.);
    float noiseSm=vnoise(vec3(vNdc.xy,1.)*500.);
    float noiseLg=vnoise(vec3(vNdc.xy,uTime/4.)*5.);
    float noise=map(noiseSm,0.,1.,-1.,1.)+map(noiseLg,0.,1.,-1.,1.);
    stroke+=noise;
    float F=fresnel(0.,.5,3.,vEyeVector,vNormal);
    float stroke1=invert(smoothstep(light-.2,light+.2,stroke))-F;
    float stroke2=invert(smoothstep(2.*light-2.,2.*light+2.,stroke1));
    // transition with perlin noise
    vec3 normalizedNdc=map(vNdc,vec3(-1.),vec3(1.),vec3(0.),vec3(1.));
    float perlinNoise=texture2D(uPerlinNoiseTexture,normalizedNdc.xy).r;
    float progress=uTransitionProgress;
    progress+=map(perlinNoise,0.,1.,-1.,1.)*.2;
    float distanceFromCenter=length(vNdc.xy);
    progress=smoothstep(progress-.005,progress,distanceFromCenter);
    float finalStroke=mix(stroke2,stroke1,progress);
    vec3 color=vec3(finalStroke);
    gl_FragColor=vec4(color,1.);
}