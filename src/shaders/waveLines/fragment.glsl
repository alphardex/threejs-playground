#pragma glslify:centerUv=require(../modules/centerUv)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

float line(float pos,float halfWidth,float offset){
    return smoothstep(halfWidth,0.,abs(pos+offset));
}

void main(){
    vec2 uv=centerUv(vUv,uResolution);
    vec3 waveColor=vec3(0.);
    for(float i=0.;i<10.;i++){
        // wave lines
        float waveLine=line(uv.y,.01,0.);
        waveColor+=vec3(waveLine);
        
        // anime
        float xOffset=sin(uv.x+uTime+i*.1)*.075;
        uv.y+=xOffset;
    }
    gl_FragColor=vec4(waveColor,1.);
}