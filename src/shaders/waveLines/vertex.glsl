varying vec2 vUv;
varying vec3 vPosition;

uniform float uLineLength;
uniform float uLineSpace;
uniform float uLineThickness;
uniform float uLineUvScale;
uniform float uNoiseAmount;
uniform vec2 uNoiseScale;
uniform float uPointSize;
uniform float uCycle;
uniform float uCurveOffset;

varying float vLuminance;

/** 4 harmonics packed in a vec4*/
vec4 h=vec4(1.,2.,3.,4.);
vec4 hAmp=vec4(.5,.5,.25,.25);
vec4 hTimePhase=vec4(2,-2,4,-4);
vec4 hZMulFreq=vec4(.05,1.,1.,1.);
vec4 hZMulPhaseOffset=vec4(0.,.25,.50,.75);
vec4 hZMulTimePhase=vec4(4,8,-4,-16);

float sumComponents(vec4 v){
    return dot(v,vec4(1.));
}

void wave(in vec2 params,out vec3 position,float cycle){
    params.x+=uCurveOffset;
    position=vec3(params.x*uLineLength,0.,params.y*uLineSpace);
    vec2 tc=params*uNoiseScale;
    vec4 angle=tc.x*h+hTimePhase*cycle;
    vec4 zwave=.5+.5*cos(tc.x+tc.y*hZMulFreq+hZMulPhaseOffset+cycle*hZMulTimePhase);
    vec4 amp=hAmp*zwave;
    vec4 deltaY=amp*sin(angle);
    vec4 derivY=amp*cos(angle)*h;
    vec4 deltaZ=sin(angle);
    position.y=uNoiseAmount*sumComponents(deltaY);
    position.z*=.75+.20*sumComponents(deltaZ);
}

void main(){
    float planeRot=20.*(position.z-uCycle);
    vec2 pOffset=vec2(
        .01*cos(planeRot),
        .1*sin(planeRot)
    );
    vec3 pos;
    wave(position.xy+pOffset,pos,position.z-uCycle);
    
    vec4 modelPosition=modelMatrix*vec4(pos,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    gl_PointSize=uPointSize/gl_Position.w;
    
    vUv=uv;
    vPosition=position;
    vLuminance=.4+.2*cos(200.*(position.z-uCycle));
}