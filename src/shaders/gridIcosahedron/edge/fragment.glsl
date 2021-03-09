uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uWidth;

varying vec2 vUv;
varying vec3 vCenter;

// https://threejs.org/examples/?q=wire#webgl_materials_wireframe
float edgeFactorTri(){
    vec3 d=fwidth(vCenter);
    vec3 a3=smoothstep(d*(uWidth-.5),d*(uWidth+.5),vCenter);
    return min(min(a3.x,a3.y),a3.z);
}

float invert(float n){
    return 1.-n;
}

void main(){
    float line=invert(edgeFactorTri());
    if(line<.1){
        discard;
    }
    vec4 color=vec4(vec3(line),1.);
    gl_FragColor=color;
}