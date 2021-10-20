#pragma glslify:random=require(glsl-random)

varying vec2 vUv;
varying vec3 vPosition;

varying float vRandColor;

void main(){
    // rand particle size and color
    float randSize=random(uv);
    float randColor=random(uv);
    
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    
    gl_Position=projectedPosition;
    gl_PointSize=20.*(1./-viewPosition.z)*randSize;
    
    vUv=uv;
    vPosition=position;
    vRandColor=randColor;
}