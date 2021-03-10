#pragma glslify:invert=require(../modules/invert.glsl)

varying float vOpacity;

uniform vec3 uColor;

void main(){
    vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
    vec2 cUv=2.*uv-1.;
    vec4 color=vec4(1./length(cUv));
    color*=vOpacity;
    color.rgb*=uColor;
    gl_FragColor=color;
}