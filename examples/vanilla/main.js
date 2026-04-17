import { trimSidebearings } from "sidebearing-trim";

const sampleText = `Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit.`;
const mount = document.getElementById("text");

if (!mount) {
  throw new Error("Missing #text element");
}

mount.textContent = sampleText;
await trimSidebearings(mount, "/fonts/inter-latin-400-normal.woff", {
  trimEnabled: true,
});
