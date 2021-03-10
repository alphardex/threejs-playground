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
float readDepth(sampler2D depthSampler,vec2 coord,float camNear,float camFar){
    float fragCoordZ=texture2D(depthSampler,coord).x;
    float viewZ=perspectiveDepthToViewZ(fragCoordZ,camNear,camFar);
    return viewZToOrthographicDepth(viewZ,camNear,camFar);
}

#pragma glslify:export(readDepth)