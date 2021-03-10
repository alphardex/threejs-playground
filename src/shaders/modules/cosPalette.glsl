// https://iquilezles.org/www/articles/palettes/palettes.htm
vec3 cosPalette(in float t,in vec3 a,in vec3 b,in vec3 c,in vec3 d)
{
    return a+b*cos(6.28318*(c*t+d));
}

#pragma glslify:export(cosPalette)