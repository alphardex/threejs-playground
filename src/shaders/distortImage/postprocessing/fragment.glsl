uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uScrollSpeed;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    float area=smoothstep(.4,.0,vUv.y);
    area=pow(area,4.);
    newUv.x-=(vUv.x-.5)*.1*area*uScrollSpeed;
    vec4 color=texture2D(tDiffuse,newUv);
    // vec4 color=vec4(area,0.,0.,1.);
    gl_FragColor=color;
}