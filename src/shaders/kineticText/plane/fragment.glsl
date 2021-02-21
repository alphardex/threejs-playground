uniform sampler2D uTexture;
uniform float uTime;
uniform float uVelocity;
uniform float uShadow;

varying vec2 vUv;
varying vec3 vPosition;
varying float vWave;

vec3 invert(vec3 n){
    return 1.-n;
}

// map函数：将本身的范围转换为另一个范围
// https://gist.github.com/companje/29408948f1e8be54dd5733a74ca49bb9
// https://stackoverflow.com/questions/17134839/how-does-the-map-function-in-processing-work
float map(float value,float min1,float max1,float min2,float max2){
    return min2+(value-min1)*(max2-min2)/(max1-min1);
}

void main(){
    vec2 repeat=vec2(4.,16.);
    vec2 repeatedUv=vUv*repeat;
    vec2 uv=fract(repeatedUv);
    vec3 texture=texture2D(uTexture,uv).rgb;
    // texture*=vec3(uv.x,uv.y,1.);
    float wave=vWave;
    wave=map(wave,-1.,1.,0.,.1);
    float shadow=1.-wave;
    vec3 color=vec3(texture*shadow);
    gl_FragColor=vec4(color,1.);
}