varying vec3 vNormal;

void main(){
    // https://stackoverflow.com/questions/47710377/how-to-implement-meshnormalmaterial-in-three-js-by-glsl
    vec3 color=.5*vNormal+.5;
    gl_FragColor=vec4(color,1.);
}