float sineEggCarton(vec3 p){
    return 1.2*abs(sin(p.x)-cos(p.y)+sin(p.z));
}
#pragma glslify:export(sineEggCarton)