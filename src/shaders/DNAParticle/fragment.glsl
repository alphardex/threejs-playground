uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;
varying vec3 vPosition;

varying float vRandColor;

void main(){
    // rand particle color
    vec3 color=uColor1;
    if(vRandColor>0.&&vRandColor<.33){
        color=uColor2;
    }else if(vRandColor>.33&&vRandColor<.66){
        color=uColor3;
    }
    
    gl_FragColor=vec4(color,1.);
}