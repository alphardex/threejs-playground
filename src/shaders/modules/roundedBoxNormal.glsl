vec3 roundedboxNormal(in vec3 pos,in vec3 siz,in float rad){
    return normalize(sign(pos)*max(abs(pos)-siz,0.));
}
#pragma glslify:export(roundedboxNormal)