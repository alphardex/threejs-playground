#pragma glslify:getWorldPosition=require(./getWorldPosition)

// https://tympanus.net/codrops/2019/10/29/real-time-multiside-refraction-in-three-steps/
vec3 getEyeVector(mat4 modelMat,vec3 pos,vec3 camPos){
    vec4 worldPosition=getWorldPosition(modelMat,pos);
    vec3 eyeVector=normalize(worldPosition.xyz-camPos);
    return eyeVector;
}

#pragma glslify:export(getEyeVector)