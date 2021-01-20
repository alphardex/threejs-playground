const bellModelUrl = "./static/models/bell.gltf";
const woodTextureUrl = "./static/textures/wood.jpg";
const bellAudioUrl = "./static/audios/bell.mp3";
const pavilionModelUrl = "./static/models/pavilion.gltf";
const planeTextureUrl = "./static/textures/plane.jpg";
const cloudModelUrl = "./static/models/cloud.fbx";
const skyParams = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.7,
  inclination: 0.49, // elevation / inclination
  azimuth: 0.25, // Facing front,
  exposure: 0.5
};
export {
  bellModelUrl,
  woodTextureUrl,
  bellAudioUrl,
  pavilionModelUrl,
  planeTextureUrl,
  cloudModelUrl,
  skyParams
};
