uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uRadius;
uniform float uPower;

varying vec2 vUv;

void main(){
    vec2 pivot=vec2(.5);
    float aspect=uResolution.x/uResolution.y;
    vec2 d=vUv-pivot;
    float rDist=length(d);
    float gr=pow(rDist/uRadius,uPower);
    float mag=2.-cos(gr-1.);
    vec2 uvR=pivot+d*mag;
    vec4 color=texture2D(tDiffuse,uvR);
    gl_FragColor=color;
}