// From: three.js\src\renderers\shaders\ShaderChunk\packing.glsl.js
float viewZToPerspectiveDepth(const in float viewZ,const in float near,const in float far){
    return((near+viewZ)*far)/((far-near)*viewZ);
}

float viewZToOrthographicDepth(const in float viewZ,const in float near,const in float far){
    return(viewZ+near)/(near-far);
}

float perspectiveDepthToViewZ(const in float invClipZ,const in float near,const in float far){
    return(near*far)/((far-near)*invClipZ-far);
}

// From: three.js\examples\webgl_depth_texture.html
uniform float cameraNear;
uniform float cameraFar;
uniform sampler2D uDepth;

varying vec2 vUv;

float readDepth(sampler2D depthSampler,vec2 coord){
    float fragCoordZ=texture2D(depthSampler,coord).x;
    float viewZ=perspectiveDepthToViewZ(fragCoordZ,cameraNear,cameraFar);
    return viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);
}

void main(){
    vUv=uv;
    
    float depth=readDepth(uDepth,vUv);
    vec3 pos=position;
    pos.z+=depth;
    vec4 modelPosition=modelMatrix*vec4(pos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
}