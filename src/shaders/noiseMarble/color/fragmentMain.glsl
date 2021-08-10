float rayMarch(vec3 eye,vec3 ray){
    float iter=64.;
    float ratio=1./iter;
    vec3 p=eye;
    float depth=0.;
    
    for(float i=0.;i<iter;i++){
        p+=ray*ratio*.6;
        vec2 uv=equirectUv(p);
        float h=texture2D(uHeightmap,uv).r;
        float cutoff=1.-i*ratio;
        float slice=smoothstep(cutoff,cutoff+.2,h);
        float dist=slice*ratio;
        depth+=dist;
    }
    
    return depth;
}