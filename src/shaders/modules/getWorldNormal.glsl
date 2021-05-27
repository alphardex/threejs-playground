vec4 getWorldNormal(mat4 modelMat,vec3 normal){
    vec4 worldNormal=normalize((modelMat*vec4(normal,0.)));
    return worldNormal;
}

#pragma glslify:export(getWorldNormal)