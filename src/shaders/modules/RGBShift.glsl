#pragma glslify:blackAndWhite=require(./blackAndWhite)

// https://github.com/spite/Wagner/blob/master/fragment-shaders/rgb-split-fs.glsl
vec4 RGBShift(sampler2D tDiffuse,vec2 uv,vec2 rOffset,vec2 gOffset,vec2 bOffset,float isBlackWhite){
    vec4 color1=texture2D(tDiffuse,uv+rOffset);
    vec4 color2=texture2D(tDiffuse,uv+gOffset);
    vec4 color3=texture2D(tDiffuse,uv+bOffset);
    if(isBlackWhite==1.){
        color1.rgb=blackAndWhite(color1.rgb);
        color2.rgb=blackAndWhite(color2.rgb);
        color3.rgb=blackAndWhite(color3.rgb);
    }
    vec4 color=vec4(color1.r,color2.g,color3.b,color1.a+color2.a+color3.a);
    return color;
}

#pragma glslify:export(RGBShift)