uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uVelocity;
uniform float uCylinderOpacity;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec2 repeat=vec2(1.,1.);
    vec2 repeatedUv=vUv*repeat;
    vec2 displacement=vec2(uTime*uVelocity,0.);
    vec2 uv=fract(repeatedUv+displacement);
    vec3 texture=texture2D(uTexture,uv).rgb;
    vec3 color=vec3(texture);
    gl_FragColor=vec4(color,uCylinderOpacity);
}