uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

uniform vec3 uColor;

varying float vLuminance;

float discPat(){
    float strength=distance(gl_PointCoord,vec2(.5));
    strength=step(strength,.5);
    return strength;
}

void main(){
    float disc=discPat();
    vec3 pointColor=uColor*disc;
    vec4 color=vec4(pointColor,1.);
    if(color.r<.5&&color.g<.5&&color.b<.5){
        discard;
    }
    color*=(vLuminance*2.);
    gl_FragColor=color;
}