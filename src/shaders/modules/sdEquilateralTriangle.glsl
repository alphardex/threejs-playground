float sdEquilateralTriangle(in vec2 p)
{
    const float k=sqrt(3.);
    p.x=abs(p.x)-1.;
    p.y=p.y+1./k;
    if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;
    p.x-=clamp(p.x,-2.,0.);
    return-length(p)*sign(p.y);
}
#pragma glslify:export(sdEquilateralTriangle);
