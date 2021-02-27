// https://i.loli.net/2021/02/27/9KNcMUrHSIbGfop.png
// https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
// https://www.iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
// https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
// https://www.iquilezles.org/www/articles/smin/smin.htm
// https://github.com/hughsk/matcap/blob/master/matcap.glsl
// https://www.shadertoy.com/view/4scSW4
// https://gist.github.com/sephirot47/f942b8c252eb7d1b7311

uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uProgress;
uniform vec2 uResolution;
uniform float uVelocity;

varying vec2 vUv;

mat4 rotationMatrix(vec3 axis,float angle){
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;
    
    return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
    0.,0.,0.,1.);
}

vec3 rotate(vec3 v,vec3 axis,float angle){
    mat4 m=rotationMatrix(axis,angle);
    return(m*vec4(v,1.)).xyz;
}

float smin(float a,float b,float k)
{
    float h=clamp(.5+.5*(b-a)/k,0.,1.);
    return mix(b,a,h)-k*h*(1.-h);
}

float sdSphere(vec3 p,float r)
{
    return length(p)-r;
}

float sdBox(vec3 p,vec3 b)
{
    vec3 q=abs(p)-b;
    return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);
}

float sdf(vec3 p){
    vec3 p1=rotate(p,vec3(1.),uTime*uVelocity);
    float box=sdBox(p1,vec3(.3));
    float sphere=sdSphere(p,.3);
    float sBox=smin(box,sphere,.3);
    float mixedBox=mix(sBox,box,uProgress);
    float aspect=uResolution.x/uResolution.y;
    vec2 mousePos=uMouse;
    mousePos.x*=aspect;
    float mouseSphere=sdSphere(p-vec3(mousePos,0.),.15);
    return smin(mixedBox,mouseSphere,.1);
}

vec3 calcNormal(in vec3 p)// for function f(p)
{
    const float eps=.0001;// or some other value
    const vec2 h=vec2(eps,0);
    return normalize(vec3(sdf(p+h.xyy)-sdf(p-h.xyy),
    sdf(p+h.yxy)-sdf(p-h.yxy),
    sdf(p+h.yyx)-sdf(p-h.yyx)));
}

vec2 matcap(vec3 eye,vec3 normal){
    vec3 reflected=reflect(eye,normal);
    float m=2.8284271247461903*sqrt(reflected.z+1.);
    return reflected.xy/m+.5;
}

float fresnel(float bias,float scale,float power,vec3 I,vec3 N)
{
    return bias+scale*pow(1.+dot(I,N),power);
}

vec3 background(vec2 uv){
    float dist=length(uv-vec2(.5));
    vec3 bg=mix(vec3(.3),vec3(.0),dist);
    return bg;
}

void main(){
    vec2 newUv=vUv;
    newUv=2.*newUv-1.;
    float aspect=uResolution.x/uResolution.y;
    newUv.x*=aspect;
    vec3 camPos=vec3(0.,0.,2.5);
    vec3 ray=normalize(vec3(newUv,-camPos.z));
    vec3 bg=background(vUv);
    vec3 normal;
    vec3 color=bg;
    float progress=0.;
    float progressMin=.0001;
    float progressMax=5.;
    for(int i=0;i<256;i++){
        vec3 pos=camPos+progress*ray;
        float d=sdf(pos);
        if(d<progressMin||d>progressMax){
            break;
        }
        progress+=d;
    }
    if(progress<progressMax){
        vec3 pos=camPos+progress*ray;
        normal=calcNormal(pos);
        color=normal;
        vec2 matcapUv=matcap(ray,normal);
        color=texture2D(uTexture,matcapUv).rgb;
        float F=fresnel(0.,.4,3.2,ray,normal);
        color=mix(color,bg,F);
    }
    gl_FragColor=vec4(color,1.);
}