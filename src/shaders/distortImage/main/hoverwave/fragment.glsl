uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uHoverState;

varying vec2 vUv;

void main(){
    vec2 newUv=vUv;
    float x=uHoverState;
    x=smoothstep(.0,1.,(x*2.+newUv.y-1.));
    vec4 color=mix(
        texture2D(uTexture,(newUv-.5)*(1.-x)+.5),
        texture2D(uTexture,(newUv-.5)*x+.5),
    x);
    gl_FragColor=color;
}