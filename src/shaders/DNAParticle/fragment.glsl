#pragma glslify:circle=require(../modules/circle)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uGradInner;

varying vec2 vUv;
varying vec3 vPosition;

varying float vRandColor;
varying float vRandAlpha;

void main(){
    // rand particle color
    vec3 color=uColor1;
    if(vRandColor>0.&&vRandColor<.33){
        color=uColor2;
    }else if(vRandColor>.33&&vRandColor<.66){
        color=uColor3;
    }
    color*=vRandAlpha;
    
    // circle alpha
    float alpha=circle(gl_PointCoord,1.);
    // vertical grad mask
    alpha*=smoothstep(.41,.72,vUv.y);
    
    vec4 finalColor=vec4(color,1.)*alpha;
    gl_FragColor=finalColor;
}