float circle(vec2 st,float r){
    vec2 dist=st-vec2(.5);
    return 1.-smoothstep(r-(r*1.15),r,dot(dist,dist)*4.);
}
#pragma glslify:export(circle);
