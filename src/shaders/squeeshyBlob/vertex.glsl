#pragma glslify:snoise4=require(glsl-noise/simplex/4d)

uniform float uSpikeCount;
uniform float uSpikeLength;
uniform vec2 uImpulse;
uniform float uSceneRotationY;

varying vec2 vUv;
varying vec3 vPosition;
varying float vNoise;

void main(){
    float noise=snoise4(vec4(position*uSpikeCount,10.)*uSpikeLength)*.5;
    vec3 newPos=position+noise*normal;
    if(noise>0.){
        float intensity=noise*5.;
        // hor
        float angleH=atan(newPos.z,newPos.x);
        float hLength=length(vec2(newPos.z,newPos.x));
        float xStrength=intensity*uImpulse.x;
        float xPos=hLength*cos(angleH+xStrength);
        float zPos=hLength*sin(angleH+xStrength);
        // ver
        float zPos2=hLength*sin(angleH+xStrength-uSceneRotationY);
        float yStrength=intensity*uImpulse.y;
        float angleV=atan(zPos2,newPos.y)-yStrength;
        float vLength=length(vec2(zPos2,newPos.y));
        float yPos=vLength*cos(angleV);
        newPos=vec3(xPos,yPos,zPos);
    }
    vec4 modelPosition=modelMatrix*vec4(newPos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
    vNoise=noise;
}