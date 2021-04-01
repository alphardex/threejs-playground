// https://www.shadertoy.com/view/lslcWj
float SineEggCarton(vec3 p){
    return.1+abs(sin(p.x)-cos(p.y)+sin(p.z))*1.2*1.;
}
#pragma glslify:export(SineEggCarton)