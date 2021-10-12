#pragma glslify:rotate=require(glsl-rotate)

vec3 rotateByOrigin(vec3 v,vec3 axis,float angle,vec3 origin){
    v-=origin;
    v=rotate(v,axis,angle);
    v+=origin;
    return v;
}

#pragma glslify:export(rotateByOrigin)