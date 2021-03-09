uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uRGBShift;

varying vec2 vUv;

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float hash(vec2 p){return fract(1e4*sin(17.*p.x+p.y*.1)*(.1+abs(sin(p.y*13.+p.x))));}

vec3 blackAndWhite(vec3 color){
    return vec3((color.r+color.g+color.b)/5.);
}

// https://github.com/spite/Wagner/blob/master/fragment-shaders/rgb-split-fs.glsl
vec4 RGBShift(sampler2D tDiffuse,vec2 uv,vec2 offset,float isBlackWhite){
    vec4 color1=texture2D(tDiffuse,vUv-offset);
    vec4 color2=texture2D(tDiffuse,vUv);
    vec4 color3=texture2D(tDiffuse,vUv+offset);
    if(isBlackWhite==1.){
        color1.rgb=blackAndWhite(color1.rgb);
        color2.rgb=blackAndWhite(color2.rgb);
        color3.rgb=blackAndWhite(color3.rgb);
    }
    vec4 color=vec4(color1.r,color2.g,color3.b,color1.a+color2.a+color3.a);
    return color;
}

void main(){
    float noise=hash(vUv+uTime)*.1;
    vec4 color=RGBShift(tDiffuse,vUv,vec2(.01)*uRGBShift,1.);
    color.rgb+=vec3(noise);
    gl_FragColor=color;
}