mat3 setCamera(in vec3 ro,in vec3 ta,float cr)
{
    vec3 cw=normalize(ta-ro);
    vec3 cp=vec3(sin(cr),cos(cr),0.);
    vec3 cu=normalize(cross(cw,cp));
    vec3 cv=(cross(cu,cw));
    return mat3(cu,cv,cw);
}

#pragma glslify:export(setCamera)