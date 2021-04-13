
#pragma glslify:roundedboxIntersectModified=require(../modules/roundedboxIntersectModified)
#pragma glslify:rotation3d=require(glsl-rotate/rotation-3d)
#pragma glslify:rand=require(glsl-random)
#pragma glslify:roundedboxNormal=require(../modules/roundedboxNormal)
#pragma glslify:inverse=require(glsl-inverse)
#pragma glslify:QUARTER_PI=require(glsl-constants/QUARTER_PI)
#pragma glslify:centerUv=require(../modules/centerUv)

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMorphPower;
uniform float uRefractionPower;
uniform float uLightChannelDelta;
uniform float uAngle;
uniform float uZDistance;

struct Scene{
    vec3 outerSize;
    float outerRadius;
    vec3 innerSize;
    float innerRadius;
    
    vec3 light[2];
    vec3 projectedLight[2];
    
    mat4 localToWorld;
    mat4 worldToLocal;
}scene;

vec3 ptransform(in mat4 mat,in vec3 v){
    return(mat*vec4(v,1.)).xyz;
}

vec3 ntransform(in mat4 mat,in vec3 v){
    return(mat*vec4(v,0.)).xyz;
}

vec4 rayFromOutside=vec4(0.,1.,1.,0.);
vec4 rayFromInside=vec4(10.,-1.,0.,1.);

float traceOuter1(vec3 rayOrigin,vec3 rayDirection,float eta,vec4 sign){
    rayDirection=normalize(rayDirection);
    float power=0.;
    float d=roundedboxIntersectModified(rayOrigin,rayDirection,scene.outerSize,scene.outerRadius);
    if(d<1e14){
        vec3 pos=rayOrigin+rayDirection*d;
        vec3 nor=-roundedboxNormal(pos,scene.outerSize,scene.outerRadius);
        
        rayDirection=-rayDirection;
        vec3 reflection=reflect(rayDirection,nor);
        vec3 refraction=refract(rayDirection,nor,eta);
        
        vec3 nrefl=normalize(reflection);
        float reflectedLight=
        smoothstep(.95,1.,dot(normalize(scene.projectedLight[0]-pos),nrefl))+
        smoothstep(.75,1.,dot(normalize(scene.projectedLight[1]-pos),nrefl))
        ;
        power+=reflectedLight;
        
        float refractedLights[2];
        refractedLights[0]=dot(normalize(scene.light[0]-pos),normalize(refraction));
        refractedLights[1]=dot(normalize(scene.light[1]-pos),normalize(refraction));
        float refractedLight=(
            smoothstep(.0,1.,refractedLights[0])
            +smoothstep(.0,1.,refractedLights[1])
        )
        ;
        power+=refractedLight;
    }
    return power;
}

float traceOuter2(vec3 rayOrigin,vec3 rayDirection,float eta,vec4 sign){
    rayDirection=normalize(rayDirection);
    float power=0.;
    float d=roundedboxIntersectModified(rayOrigin,rayDirection,scene.outerSize,scene.outerRadius);
    if(d<1e14){
        vec3 pos=rayOrigin+rayDirection*d;
        vec3 nor=-roundedboxNormal(pos,scene.outerSize,scene.outerRadius);
        
        rayDirection=-rayDirection;
        vec3 reflection=reflect(rayDirection,nor);
        vec3 refraction=refract(rayDirection,nor,eta);
        
        vec3 nrefl=normalize(reflection);
        float reflectedLight=
        smoothstep(.95,1.,dot(normalize(scene.projectedLight[0]-pos),nrefl))+
        smoothstep(.75,1.,dot(normalize(scene.projectedLight[1]-pos),nrefl))
        ;
        power+=reflectedLight;
        
        float refractedLights[2];
        refractedLights[0]=dot(normalize(scene.light[0]-pos),normalize(refraction));
        refractedLights[1]=dot(normalize(scene.light[1]-pos),normalize(refraction));
        float refractedLight=(
            smoothstep(.0,1.,refractedLights[0])
            +smoothstep(.0,1.,refractedLights[1])
        )
        ;
        power+=refractedLight;
        
        power+=
        traceOuter1(pos+rayFromInside.x*reflection,-reflection,eta,rayFromInside)
        *.8;
    }
    return power;
}

float traceInner1(vec3 rayOrigin,vec3 rayDirection,float eta,vec4 sign){
    rayDirection=normalize(rayDirection);
    float power=0.;
    float d=roundedboxIntersectModified(rayOrigin,rayDirection,scene.innerSize,scene.innerRadius);
    if(d<1e14){
        power+=.001;
        vec3 pos=rayOrigin+rayDirection*d;
        vec3 nor=sign.y*roundedboxNormal(pos,scene.innerSize,scene.innerRadius);
        rayDirection*=sign.y;
        vec3 reflection=reflect(rayDirection,nor);
        vec3 refraction=refract(rayDirection,nor,eta);
        
        vec3 nrefl=normalize(reflection);
        float reflectedLight=
        smoothstep(.95,1.,dot(normalize(scene.projectedLight[0]-pos),nrefl))+
        smoothstep(.75,1.,dot(normalize(scene.projectedLight[1]-pos),nrefl))
        ;
        power+=reflectedLight;
        
    }
    return power;
}

float traceInner2(vec3 rayOrigin,vec3 rayDirection,float eta,vec4 sign){
    rayDirection=normalize(rayDirection);
    float power=0.;
    float d=roundedboxIntersectModified(rayOrigin,rayDirection,scene.innerSize,scene.innerRadius);
    if(d<1e14){
        power+=.001;
        vec3 pos=rayOrigin+rayDirection*d;
        vec3 nor=sign.y*roundedboxNormal(pos,scene.innerSize,scene.innerRadius);
        rayDirection*=sign.y;
        vec3 reflection=reflect(rayDirection,nor);
        vec3 refraction=refract(rayDirection,nor,eta);
        
        vec3 nrefl=normalize(reflection);
        float reflectedLight=
        smoothstep(.95,1.,dot(normalize(scene.projectedLight[0]-pos),nrefl))+
        smoothstep(.75,1.,dot(normalize(scene.projectedLight[1]-pos),nrefl))
        ;
        power+=reflectedLight;
        
        vec3 rayOuter=sign.z*reflection+sign.w*refraction;
        vec3 rayInner=sign.w*reflection+sign.z*refraction;
        
        power+=traceInner1(pos+rayFromInside.x*rayInner,rayFromInside.y*rayInner,eta,rayFromInside)*.8;
    }
    return power;
}

float traceInner3(vec3 rayOrigin,vec3 rayDirection,float eta,vec4 sign){
    rayDirection=normalize(rayDirection);
    float power=0.;
    float d=roundedboxIntersectModified(rayOrigin,rayDirection,scene.innerSize,scene.innerRadius);
    if(d<1e14){
        power+=.001;
        vec3 pos=rayOrigin+rayDirection*d;
        vec3 nor=sign.y*roundedboxNormal(pos,scene.innerSize,scene.innerRadius);
        rayDirection*=sign.y;
        vec3 reflection=reflect(rayDirection,nor);
        vec3 refraction=refract(rayDirection,nor,eta);
        
        vec3 nrefl=normalize(reflection);
        float reflectedLight=
        smoothstep(.95,1.,dot(normalize(scene.projectedLight[0]-pos),nrefl))+
        smoothstep(.75,1.,dot(normalize(scene.projectedLight[1]-pos),nrefl))
        ;
        power+=reflectedLight;
        
        vec3 rayOuter=sign.z*reflection+sign.w*refraction;
        vec3 rayInner=sign.w*reflection+sign.z*refraction;
        
        power+=traceInner2(pos+rayFromInside.x*rayInner,rayFromInside.y*rayInner,eta,rayFromInside)*.8;
    }
    return power;
}

vec3 trace(vec3 rayOrigin,vec3 rayDirection){
    rayDirection=normalize(rayDirection);
    vec3 power=vec3(0.,0.,0.);
    float d=roundedboxIntersectModified(rayOrigin,rayDirection,scene.outerSize,scene.outerRadius);
    if(d<1e14){
        vec3 pos=rayOrigin+rayDirection*d;
        vec3 nor=roundedboxNormal(pos,scene.outerSize,scene.outerRadius);
        
        float refractionPowerR=uRefractionPower+uLightChannelDelta;
        float refractionPowerB=uRefractionPower-uLightChannelDelta;
        vec3 refractionR=refract(rayDirection,nor,refractionPowerR);
        vec3 refractionG=refract(rayDirection,nor,uRefractionPower);
        vec3 refractionB=refract(rayDirection,nor,refractionPowerB);
        float ir=traceInner3(pos,refractionR,refractionPowerR,rayFromOutside);
        float ib=traceInner3(pos,refractionG,uRefractionPower,rayFromOutside);
        float ig=traceInner3(pos,refractionB,refractionPowerB,rayFromOutside);
        power.r+=ir>0.?ir:traceOuter2(pos+refractionR*rayFromInside.x,-refractionR,refractionPowerR,rayFromInside);
        power.g+=ig>0.?ig:traceOuter2(pos+refractionG*rayFromInside.x,-refractionG,uRefractionPower,rayFromInside);
        power.b+=ib>0.?ib:traceOuter2(pos+refractionB*rayFromInside.x,-refractionB,refractionPowerB,rayFromInside);
    }
    return power;
}

void main(){
    
    scene.localToWorld=rotation3d(vec3(0.,0.,1.),QUARTER_PI);
    scene.worldToLocal=inverse(scene.localToWorld);
    
    float innerFactor=mix(.5,.375,uMorphPower);
    scene.outerSize=vec3(uMorphPower);
    scene.outerRadius=1.-uMorphPower;
    scene.innerSize=vec3(scene.outerRadius*innerFactor);
    scene.innerRadius=uMorphPower*innerFactor;
    
    vec3 power=vec3(0.);
    
    vec3 rayOrigin=vec3(uZDistance*cos(uAngle),0.,uZDistance*sin(uAngle));
    vec3 ww=normalize(-rayOrigin);
    vec3 uu=normalize(cross(ww,vec3(0.,1.,0.)));
    vec3 vv=(cross(uu,ww));
    
    vec3 rayOriginLocal=ptransform(scene.worldToLocal,rayOrigin);
    
    scene.light[0]=vec3(.2,2.,-.8);
    scene.light[1]=vec3(.2,-2.,-.8);
    vec3 dir;
    
    scene.light[0]=scene.light[0].x*uu+scene.light[0].y*vv+scene.light[0].z*ww;
    scene.light[0]=ptransform(scene.worldToLocal,scene.light[0]);
    dir=normalize(-scene.light[0]);
    scene.projectedLight[0]=scene.light[0]+dir*roundedboxIntersectModified(scene.light[0],dir,scene.outerSize,scene.outerRadius);
    
    scene.light[1]=scene.light[1].x*uu+scene.light[1].y*vv+scene.light[1].z*ww;
    scene.light[1]=ptransform(scene.worldToLocal,scene.light[1]);
    dir=normalize(-scene.light[1]);
    scene.projectedLight[1]=scene.light[1]+dir*roundedboxIntersectModified(scene.light[1],dir,scene.outerSize,scene.outerRadius);
    
    for(int m=0;m<2;m++)
    for(int n=0;n<2;n++)
    {
        vec2 p=centerUv(vUv,uResolution);
        
        vec3 rayDirection=normalize(p.x*uu+p.y*vv+3.*ww);
        vec3 rayDirectionLocal=ntransform(scene.worldToLocal,rayDirection);
        
        power+=trace(rayOriginLocal,rayDirectionLocal);
        
    }
    
    power/=4.;
    
    power=clamp(power,0.,1.);
    
    gl_FragColor=vec4(power,1.);
}
