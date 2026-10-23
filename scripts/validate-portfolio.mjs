import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(path), "utf8");
const html = read("index.html");
const data = read("js/data.js");
const ide = read("js/ide.js");
const dija = read("js/dija.js");
const css = read("css/os.css");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual([...new Set(duplicateIds)], [], "index.html must not contain duplicate IDs");

for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const raw = match[1];
  if (/^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(raw)) continue;
  const localPath = decodeURIComponent(raw.split("?")[0]);
  if (!localPath || localPath.endsWith("/")) continue;
  assert.ok(existsSync(resolve(localPath)), `Missing local HTML asset: ${raw}`);
}

const projectStart = data.indexOf("const PROJECTS = [");
const projectEnd = data.indexOf("\n];", projectStart);
assert.ok(projectStart >= 0 && projectEnd > projectStart, "PROJECTS data block must exist");
const projectBlock = data.slice(projectStart, projectEnd);
assert.doesNotMatch(projectBlock, /\[ADD[^\]]*\]/i, "Project UI must not contain editorial placeholders");
assert.doesNotMatch(projectBlock, /--|—|–/, "Project copy must not use double-hyphen or dash separators");
for (const match of projectBlock.matchAll(/image:\s*"([^"]+)"/g)) {
  assert.ok(existsSync(resolve(match[1])), `Missing project image: ${match[1]}`);
}

assert.match(html, /Hi! I’m Saif’s portfolio assistant\./, "DIJA must have its static welcome message");
assert.doesNotMatch(html, /Free AI endpoint\s*·\s*avoid sharing sensitive information/i, "Remove the AI endpoint disclaimer from the chat UI");
for (const action of ["projects", "experience", "expertise", "explore"]) {
  assert.match(html, new RegExp(`data-nav-action="${action}"`), `Missing taskbar action: ${action}`);
}
assert.doesNotMatch(ide, /localhost:4200/, "Preview chrome must not display a local development host");
assert.doesNotMatch(ide, /'Deployed'<\/span>/, "Private or internal projects must not be falsely labelled deployed");


assert.match(html, /id="browserPreviewWindow"/, "On-demand browser preview window must exist");
assert.match(ide, /function installPreviewControl/, "IDE files need an on-demand Preview control");
assert.match(ide, /function openBrowserPreview/, "Preview controls must open the browser-style window");
assert.match(css, /\.ide-pane \.preview-card \{ display:none !important; \}/, "Embedded previews must stay hidden in the editor");
assert.match(css, /\.browser-preview-window\[hidden\].*display:none !important/, "Closed browser preview must remain hidden");
assert.match(dija, /carousel\.classList\.add\("is-sidepanel"\)/, "Projects taskbar panel should use the same right-side panel layout");


assert.match(ide, /function renderBrowserPreviewPage/, "Browser preview must render a full navigable website shell");
assert.match(ide, /PROJECTS\.map\(\(project\) => \[project\.id, project\.name/, "Browser sidebar must list all portfolio projects");
assert.match(ide, /control\.dataset\.browserPage/, "Browser sidebar navigation must switch pages in place");
assert.match(css, /\.browser-site-shell \{ display:grid/, "Browser preview must use a website sidebar and content layout");


assert.match(css, /\.browser-preview-window \{ top:8px; left:10px; right:10px;/, "Browser preview must use the full desktop width");
assert.match(ide, /taskbarBrowserPreview/, "Browser preview must have a taskbar app button");
assert.match(ide, /profile-page/, "About page must use the professional profile layout");
assert.match(ide, /project-profile-section-heading/, "Project pages must use a structured case-study layout");
assert.match(ide, /frame.src = RESUME_PATH/, "Resume browser page must render the official PDF");
assert.doesNotMatch(projectBlock, /--|—|–/, "Project details must not contain double or long dash separators");

const versions = [...html.matchAll(/(?:src|href)="([^"]+\.(?:css|js))\?v=([^"]+)"/g)];
assert.ok(versions.some(([, path]) => path === "css/os.css"), "Stylesheet must be cache-busted");
assert.ok(versions.some(([, path]) => path === "js/ide.js"), "IDE script must be cache-busted");
assert.ok(versions.some(([, path]) => path === "js/dija.js"), "DIJA script must be cache-busted");
assert.ok(versions.some(([, path]) => path === "js/data.js"), "Project data must be cache-busted");

console.log(`Portfolio quality checks passed: ${ids.length} unique HTML IDs, ${[...projectBlock.matchAll(/image:\s*"([^"]+)"/g)].length} project images, ${versions.length} versioned assets.`);
