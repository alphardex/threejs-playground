// https://threejs.org/examples/?q=wire#webgl_materials_wireframe
float edgeFactorTri(vec3 center,float width){
    vec3 d=fwidth(center);
    vec3 a3=smoothstep(d*(width-.5),d*(width+.5),center);
    return min(min(a3.x,a3.y),a3.z);
}

#pragma glslify:export(edgeFactorTri)