varying float vDepth;

void main(){
    vec3 color=vec3(vDepth);
    gl_FragColor=vec4(color,1.);
}