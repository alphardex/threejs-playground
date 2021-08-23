uniform vec3 uColor;

void main(){
    vec3 color=uColor;
    vec4 finalColor=vec4(color,1.)*.3;
    gl_FragColor=finalColor;
}