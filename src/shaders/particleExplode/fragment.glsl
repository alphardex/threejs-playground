uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;

void main(){
    vec4 color=texture2D(uTexture,vUv);
    if(color.r<.1&&color.g<.1&&color.b<.1){
        discard;
    }
    gl_FragColor=color;
}