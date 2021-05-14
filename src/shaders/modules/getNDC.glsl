// https://community.khronos.org/t/please-help-gl-fraggl_Position-to-world-gl_Positioninates/66010
vec3 getNDC(){
    vec3 ndc=gl_Position.xyz/gl_Position.w;
    return ndc;
}

#pragma glslify:export(getNDC)