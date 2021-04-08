import ky from "kyouka";

const availableJieQis = ["大寒", "春分", "夏至", "秋分", "立冬", "冬至"];
const buildingModelUrl = "./static/models/building.gltf";
const xGap = 80;
const yGap = 60;
const randomGap = 15;
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
    pos[key] =
      value * (key === "x" ? xGap : yGap) +
      randomGap * ky.randomNumberInRange(0, 1);
  });
});

export { availableJieQis, buildingModelUrl, buildingPositions };
