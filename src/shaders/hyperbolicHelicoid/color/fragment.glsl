float diff=dot(vec3(1.),vNormal);
vec3 color=cosPalette(diff,uBrightness,uContrast,uOscilation,uPhase+uTime);
diffuseColor.rgb=color;