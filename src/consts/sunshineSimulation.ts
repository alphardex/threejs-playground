const availableJieQis = ["大寒", "春分", "夏至", "秋分", "立冬", "冬至"];
const buildingModelUrl = "./static/models/building.gltf";
const gap = 50;
const buildingPositions = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: -1, y: 1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  { x: -1, y: -1, z: 0 },
];
buildingPositions.forEach((pos) => {
  Object.entries(pos).forEach(([key, value]) => {
    pos[key] = value * gap;
  });
});

export { availableJieQis, buildingModelUrl, buildingPositions };
