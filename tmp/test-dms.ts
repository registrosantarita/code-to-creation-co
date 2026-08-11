import { degToDms, coordToDms } from "../src/lib/labels";

const azimutes = [
  339.21666944,
  339.21695,
  45.208333,
  45.2,
  45,
  0,
  -45.208333,
];

console.log("Azimutes:");
for (const v of azimutes) {
  console.log(`${v}° -> ${degToDms(v)}`);
}

const coords = [
  [-51.1234567, "lon"],
  [-20.2508667, "lat"],
  [0.0002778, "lat"],
  [3.0002778, "lat"],
] as const;

console.log("\nCoordenadas:");
for (const [v, eixo] of coords) {
  console.log(`${v} (${eixo}) -> ${coordToDms(v, eixo)}`);
}
