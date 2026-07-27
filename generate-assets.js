import fs from "fs";
import path from "path";

const ROOTPatch4 = path.resolve("./Patch4/ASSET");
const ROOTPatch5 = path.resolve("./ASSET");

const EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",

  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
]);

let assets = [];

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scan(full);
      continue;
    }

    if (!EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

    assets.push(
      full
        .replace(/\\/g, "/")
        .replace(process.cwd().replace(/\\/g, "/") + "/", "./"),
    );
  }
}

assets = [];
scan(ROOTPatch4);
assets.sort();
fs.writeFileSync("./Patch4/assets.json", JSON.stringify(assets, null, 2));
console.log(`Generated assets.json (${assets.length} assets)`);

assets = [];
scan(ROOTPatch5);
assets.sort();
fs.writeFileSync("./assets.json", JSON.stringify(assets, null, 2));
console.log(`Generated assets.json (${assets.length} assets)`);

// node generate-assets.js
