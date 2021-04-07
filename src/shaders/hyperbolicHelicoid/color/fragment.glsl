float diff=dot(vec3(1.),vNormal);
vec2 matcapUv=matcap(vec3(diff),vNormal);
vec3 color=texture2D(uTexture,matcapUv).rgb;
diffuseColor.rgb=color;