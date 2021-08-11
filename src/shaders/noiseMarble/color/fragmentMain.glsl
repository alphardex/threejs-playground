float rayMarch(vec3 eye,vec3 ray){
    float iter=64.;
    float ratio=1./iter;
    vec3 p=eye;
    float depth=0.;
    
    for(float i=0.;i<iter;i++){
        p+=ray*ratio*.6;
        vec2 uv=equirectUv(normalize(p));
        
        // displacement point
        vec2 xOffset=vec2(uTime*uSpeed,0.);
        vec3 displacement1=texture2D(uDisplacementMap,uv+xOffset).rgb;
        vec2 flipY=vec2(1.,-1.);
        vec3 displacement2=texture2D(uDisplacementMap,uv*flipY-xOffset).rgb;
        displacement1-=.5;
        displacement2-=.5;
        vec3 displacement=displacement1+displacement2;
        vec3 displaced=p+displacement*uStrength;
        uv=equirectUv(normalize(displaced));
        
        float h=texture2D(uHeightMap,uv).r;
        float cutoff=1.-i*ratio;
        float slice=smoothstep(cutoff,cutoff+.2,h);
        float dist=slice*ratio;
        depth+=dist;
    }
    
    return depth;
}