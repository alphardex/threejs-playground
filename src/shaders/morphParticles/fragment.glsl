uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

uniform vec3 uColor;

void main(){
    vec2 uv=vec2(gl_PointCoord.x,1.-gl_PointCoord.y);
    vec2 cUv=2.*uv-1.;
    vec3 color=vec3(1./length(cUv));
    color.rgb*=uColor;
    gl_FragColor=vec4(color,1.);
}