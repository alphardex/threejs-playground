#pragma glslify:capIntersect=require(./capIntersect)

float roundedboxIntersectModified(in vec3 rayOrigin,in vec3 rayDirection,in vec3 size,in float rad){
    // bounding box
    vec3 m=1./rayDirection;
    vec3 n=m*rayOrigin;
    vec3 k=abs(m)*(size+rad);
    vec3 t1=-n-k;
    vec3 t2=-n+k;
    float tN=max(max(t1.x,t1.y),t1.z);
    float tF=min(min(t2.x,t2.y),t2.z);
    if(tN>tF||tF<0.){
        return 1e15;
    }
    float t=tN;
    
    // convert to first octant
    vec3 pos=rayOrigin+t*rayDirection;
    vec3 s=sign(pos);
    vec3 ro=rayOrigin*s;
    vec3 rd=rayDirection*s;
    pos*=s;
    
    // faces
    pos-=size;
    pos=max(pos.xyz,pos.yzx);
    if(min(min(pos.x,pos.y),pos.z)<0.){
        return t;
    }
    
    t=capIntersect(ro,rd,vec3(size.x,-size.y,size.z),vec3(size.x,size.y,size.z),rad);
    t=min(t,capIntersect(ro,rd,vec3(size.x,size.y,-size.z),vec3(size.x,size.y,size.z),rad));
    t=min(t,capIntersect(ro,rd,vec3(-size.x,size.y,size.z),vec3(size.x,size.y,size.z),rad));
    
    return t;
}
#pragma glslify:export(roundedboxIntersectModified)