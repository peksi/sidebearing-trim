import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, "..");
const sourcePath = resolve(packageDir, "src/styles.css");
const outputPath = resolve(packageDir, "dist/styles.css");

await mkdir(dirname(outputPath), { recursive: true });
await copyFile(sourcePath, outputPath);
