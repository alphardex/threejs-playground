vec2 centerUv(vec2 uv,vec2 resolution){
    uv=2.*uv-1.;
    float aspect=resolution.x/resolution.y;
    uv.x*=aspect;
    return uv;
}

#pragma glslify:export(centerUv);