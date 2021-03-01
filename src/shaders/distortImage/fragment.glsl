uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vNoise;

void main(){
    vec3 redColor=vec3(1.,0.,0.);
    vec3 whiteColor=vec3(1.,1.,1.);
    vec3 mixedColor=mix(redColor,whiteColor,.5*(vNoise+1.));
    vec3 color=mixedColor;
    // color=vec3(vUv.x,vUv.y,1.);
    vec2 newUv=vUv;
    newUv=vec2(newUv.x+newUv.y*.5,newUv.y);
    vec4 oceanTexture=texture2D(uTexture,newUv);
    color=oceanTexture.rgb;
    gl_FragColor=vec4(color,1.);
}