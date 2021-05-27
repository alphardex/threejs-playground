#pragma glslify:orthogonal=require(./orthogonal)

// https://codepen.io/marco_fugaro/pen/xxZWPWJ?editors=0010
vec3 fixNormal(vec3 position,vec3 distortedPosition,vec3 normal){
    vec3 tangent=orthogonal(normal);
    vec3 bitangent=normalize(cross(normal,tangent));
    float offset=.1;
    vec3 neighbour1=position+tangent*offset;
    vec3 neighbour2=position+bitangent*offset;
    vec3 displacedNeighbour1=map(neighbour1);
    vec3 displacedNeighbour2=map(neighbour2);
    vec3 displacedTangent=displacedNeighbour1-distortedPosition;
    vec3 displacedBitangent=displacedNeighbour2-distortedPosition;
    vec3 displacedNormal=normalize(cross(displacedTangent,displacedBitangent));
    return displacedNormal;
}

#pragma glslify:export(fixNormal)