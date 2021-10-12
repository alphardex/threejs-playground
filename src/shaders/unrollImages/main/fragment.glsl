uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

uniform float uProgress;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec4 texture=texture2D(uTexture,vUv);
    vec3 color=texture.rgb;
    float alpha=clamp(uProgress*5.,0.,1.);
    gl_FragColor=vec4(color,alpha);
}