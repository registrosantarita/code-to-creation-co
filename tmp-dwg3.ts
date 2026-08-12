import { LibreDwg } from "@mlightcad/libredwg-web";
import { cadParaMemorial } from "./src/lib/cad-to-memorial";
const mod = await import("./src/lib/cad-reader.client");
const bytes = await Bun.file("/tmp/cad/s.dwg").arrayBuffer();
const lib = await LibreDwg.create("/dev-server/node_modules/@mlightcad/libredwg-web/wasm");
const db = lib.convert(lib.dwg_read_data(bytes, 0)!);
const fn = (mod as any).databaseParaDrawing;
console.log("exported?", typeof fn);
