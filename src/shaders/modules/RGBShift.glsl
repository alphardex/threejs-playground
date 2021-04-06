#pragma glslify:blackAndWhite=require(./blackAndWhite)

vec4 RGBShift(sampler2D t,vec2 rUv,vec2 gUv,vec2 bUv,float isBlackWhite){
    vec4 color1=texture2D(t,rUv);
    vec4 color2=texture2D(t,gUv);
    vec4 color3=texture2D(t,bUv);
    if(isBlackWhite==1.){
        color1.rgb=blackAndWhite(color1.rgb);
        color2.rgb=blackAndWhite(color2.rgb);
        color3.rgb=blackAndWhite(color3.rgb);
    }
    vec4 color=vec4(color1.r,color2.g,color3.b,1.);
    return color;
}

#pragma glslify:export(RGBShift)