// https://www.shadertoy.com/view/Ms2SD1
float diffuse(vec3 l,vec3 n,float p){
    return pow(dot(n,l)*.4+.6,p);
}
#pragma glslify:export(diffuse);
