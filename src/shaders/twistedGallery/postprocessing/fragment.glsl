uniform sampler2D tDiffuse;
uniform float uRadius;
uniform float uPower;

varying vec2 vUv;

void main(){
    vec2 pivot=vec2(.5);
    vec2 d=vUv-pivot;
    float rDist=length(d);
    float gr=pow(rDist/uRadius,uPower);
    float mag=2.-cos(gr-1.);
    vec2 uvR=pivot+d*mag;
    vec4 color=texture2D(tDiffuse,uvR);
    gl_FragColor=color;
}