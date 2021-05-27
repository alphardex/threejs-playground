#pragma glslify:snoise=require(glsl-noise/simplex/3d)
#pragma glslify:invert=require(../modules/invert)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uIriMap;
uniform float uIriBoost;

varying vec2 vUv;
varying vec3 vWorldNormal;

void main(){
    vec2 newUv=vUv;
    
    // pbr
    float noise=snoise(vWorldNormal*5.)*.3;
    vec3 N=normalize(vWorldNormal+vec3(noise));
    vec3 V=normalize(cameraPosition);
    float NdotV=max(dot(N,V),0.);
    float colorStrength=smoothstep(0.,.8,NdotV);
    vec3 color=invert(vec3(colorStrength));
    
    // iri
    vec3 airy=texture2D(uIriMap,vec2(NdotV*.99,0.)).rgb;
    airy*=airy;
    vec3 specularLight=vWorldNormal*airy*uIriBoost;
    
    float mixStrength=smoothstep(.3,.6,NdotV);
    vec3 finalColor=mix(specularLight,color,mixStrength);
    
    gl_FragColor=vec4(finalColor,0.);
}