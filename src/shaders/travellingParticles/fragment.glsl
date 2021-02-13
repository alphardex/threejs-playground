varying float vOpacity;

float invert(float n){
    return 1.-n;
}

void main(){
    vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
    vec2 cUv=2.*uv-1.;
    vec3 originColor=vec3(4./255.,10./255.,20./255.);
    vec4 color=vec4(.08/length(cUv));
    color*=vOpacity;
    color.rgb*=originColor*120.;
    color.a*=10.;
    gl_FragColor=vec4(color);
}