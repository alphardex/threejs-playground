#pragma glslify:snoise4=require(glsl-noise/simplex/4d)

uniform float uSpikeCount;
uniform float uSpikeLength;
uniform vec2 uImpulse;
uniform float uSceneRotationY;

varying vec2 vUv;
varying vec3 vPosition;
varying float vNoise;

vec3 impulsePos(vec3 pos,vec2 impulse,float intensity){
    // hor x,z
    float angleH=atan(pos.z,pos.x);
    float hLength=length(vec2(pos.z,pos.x));
    float xStrength=intensity*impulse.x;
    float xPos=hLength*cos(angleH+xStrength);
    float zPos=hLength*sin(angleH+xStrength);
    // ver y
    float zPos2=hLength*sin(angleH+xStrength-uSceneRotationY);
    float yStrength=intensity*impulse.y;
    float angleV=atan(zPos2,pos.y)-yStrength;
    float vLength=length(vec2(zPos2,pos.y));
    float yPos=vLength*cos(angleV);
    pos=vec3(xPos,yPos,zPos);
    return pos;
}

void main(){
    float noise=snoise4(vec4(position*uSpikeCount,10.)*uSpikeLength)*.5;
    vec3 newPos=position+noise*normal;
    float intensity=noise*5.;
    newPos=impulsePos(newPos,uImpulse,intensity);
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
    vNoise=noise;
}