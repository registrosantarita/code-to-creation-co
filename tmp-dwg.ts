import { LibreDwg } from "@mlightcad/libredwg-web";
const bytes = await Bun.file("/tmp/cad/s.dwg").arrayBuffer();
const lib = await LibreDwg.create("/dev-server/node_modules/@mlightcad/libredwg-web/wasm");
const ptr = lib.dwg_read_data(bytes, 0);
const db = lib.convert(ptr!);
const types: Record<string, number> = {};
for (const e of db.entities as any[]) types[e.type] = (types[e.type] ?? 0) + 1;
console.log(types);
console.log(JSON.stringify((db.entities as any[]).find(e=>e.type==="LWPOLYLINE"))?.slice(0,300));
