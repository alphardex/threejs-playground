vec3 ro=vPosition;
vec3 rd=normalize(vDirection);
float depth=rayMarch(ro,rd);
vec3 result=mix(uColor1,uColor2,depth);
vec4 diffuseColor=vec4(result,1.);