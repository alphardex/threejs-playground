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
varying vec2 vUv1;

float readDepth(sampler2D depthSampler,vec2 coord){
    float fragCoordZ=texture2D(depthSampler,coord).x;
    float viewZ=perspectiveDepthToViewZ(fragCoordZ,cameraNear,cameraFar);
    return viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);
}

void main(){
    // vec3 color=vec3(vUv.x,vUv.y,1.);
    // gl_FragColor=vec4(color,1.);
    
    float depth=readDepth(uDepth,vUv);
    gl_FragColor.rgb=1.-vec3(depth);
    gl_FragColor.a=1.;
}