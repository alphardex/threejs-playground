float noise=snoise(vec3(position/2.+uTime*uVelocity));
vec3 transformed=vec3(position*(noise*pow(uDistortion,2.)+uRadius));