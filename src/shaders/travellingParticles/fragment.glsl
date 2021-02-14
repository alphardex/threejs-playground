varying float vOpacity;

float invert(float n){
    return 1.-n;
}

void main(){
    vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
    vec2 cUv=2.*uv-1.;
    vec3 originColor=vec3(78.,192.,233.)/255./2.;
    vec4 color=vec4(1./length(cUv));
    color*=vOpacity;
    color.rgb*=originColor;
    gl_FragColor=color;
}