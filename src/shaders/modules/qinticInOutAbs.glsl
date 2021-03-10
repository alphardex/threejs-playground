// https://github.com/glslify/glsl-easings
float qinticInOutAbs(float t){
    return t<.5
    ?+16.*pow(t,5.)
    :-.5*abs(pow(2.*t-2.,5.))+1.;
}

#pragma glslify:export(qinticInOutAbs)