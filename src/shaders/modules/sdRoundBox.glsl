float sdRoundBox(vec3 p,vec3 b,float r)
{
    vec3 q=abs(p)-b;
    return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;
}
#pragma glslify:export(sdRoundBox)