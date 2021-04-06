#pragma glslify:PI=require(glsl-constants/PI)

// https://tympanus.net/codrops/2019/10/21/how-to-create-motion-hover-effects-with-image-distortions-using-three-js/
vec3 deformationCurve(vec3 position,vec2 uv,vec2 offset){
    position.x=position.x+(sin(uv.y*PI)*offset.x);
    position.y=position.y+(sin(uv.x*PI)*offset.y);
    return position;
}

#pragma glslify:export(deformationCurve)