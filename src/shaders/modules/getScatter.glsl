// https://ijdykeman.github.io/graphics/simple_fog_shader
// https://lusion.co/
float getScatter(vec3 start,vec3 dir,vec3 lightPos,float d,float lightDivider,float lightPow){
    // light to ray origin
    vec3 q=start-lightPos;
    
    // coefficients
    float b=dot(dir,q);
    float c=dot(q,q);
    
    // evaluate integral
    float t=c-b*b;
    float s=1./sqrt(max(.0001,t));
    float l=s*(atan((d+b)*s)-atan(b*s));
    
    return pow(max(0.,l/lightDivider),lightPow);
}

#pragma glslify:export(getScatter)