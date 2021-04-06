#pragma glslify:PI=require(glsl-constants/PI)

uniform float uTime;
uniform float uScrollSpeed;

varying vec2 vUv;

// https://tympanus.net/codrops/2019/10/21/how-to-create-motion-hover-effects-with-image-distortions-using-three-js/
vec3 deformationCurve(vec3 position,vec2 uv,vec2 offset){
    position.x=position.x+(sin(uv.y*PI)*offset.x);
    position.y=position.y+(sin(uv.x*PI)*offset.y);
    return position;
}

void main(){
    vec3 newPos=position;
    newPos=deformationCurve(newPos,uv,vec2(0.,uScrollSpeed*15.));
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
}