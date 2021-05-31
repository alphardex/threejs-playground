#pragma glslify:map=require(glsl-map)
#pragma glslify:sdEquilateralTriangle=require(../modules/sdEquilateralTriangle)

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec2 newUv=vUv;
    newUv=map(newUv,vec2(0.),vec2(1.),vec2(-1.),vec2(1.));
    newUv*=-1.;
    
    vec2 p1=newUv*2.;
    float d1=sdEquilateralTriangle(p1);
    float t1=smoothstep(0.,.02,d1);
    vec3 c1=vec3(104.,178.,129.)/255.;
    vec3 color1=mix(c1,vec3(1.),t1);
    
    vec2 p2=newUv*3.;
    p2.y+=.3;
    float d2=sdEquilateralTriangle(p2);
    float t2=smoothstep(0.,.02,d2);
    vec3 c2=vec3(54.,76.,89.)/255.;
    vec3 color2=mix(c2,vec3(1.),t2);
    
    vec2 p3=newUv*6.;
    p3.y+=1.2;
    float d3=sdEquilateralTriangle(p3);
    float t3=smoothstep(0.,.02,d3);
    vec3 c3=vec3(.5);
    vec3 color3=mix(c3,vec3(1.),t3);
    
    vec3 color=color1*color2;
    
    gl_FragColor=vec4(color,1.);
    
    if(gl_FragColor.rgb!=color1*color2*color3){
        gl_FragColor=vec4(1.);
    }
}