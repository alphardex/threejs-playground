vec3 blackAndWhite(vec3 color){
    return vec3((color.r+color.g+color.b)/5.);
}

#pragma glslify:export(blackAndWhite)