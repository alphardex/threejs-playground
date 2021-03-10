// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float hash(vec2 p){return fract(1e4*sin(17.*p.x+p.y*.1)*(.1+abs(sin(p.y*13.+p.x))));}

#pragma glslify:export(hash)