import * as fs from "fs";
import * as path from "path";
import type {
  AgentVersion,
  VersionDiff,
  DocContent,
  VersionIndex,
  ChapterImage,
} from "../src/types/agent-data";
import {
  VERSION_META,
  VERSION_ORDER,
  LEARNING_PATH,
  type VersionId,
} from "../src/lib/constants";

const WEB_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(WEB_DIR, "..");
const OUT_DIR = path.join(WEB_DIR, "src", "data", "generated");
const PUBLIC_DIR = path.join(WEB_DIR, "public");
const COURSE_ASSETS_DIR = path.join(PUBLIC_DIR, "course-assets");

type Locale = "en" | "zh";

interface ChapterSource {
  id: VersionId;
  dirName: string;
  dirPath: string;
  codePath: string;
}

function dirToVersionId(dirName: string): string | null {
  const match = dirName.match(/^(s\d{2})_/);
  return match ? match[1] : null;
}

function listRootChapters(): ChapterSource[] {
  const candidates = fs
    .readdirSync(REPO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^s(?:0[1-9]|1[0-7])_/.test(name));

  const directoriesById = new Map<string, string[]>();
  for (const dirName of candidates) {
    const id = dirToVersionId(dirName);
    if (!id) continue;
    directoriesById.set(id, [...(directoriesById.get(id) ?? []), dirName]);
  }

  const errors: string[] = [];
  const chapters: ChapterSource[] = [];

  for (const id of VERSION_ORDER) {
    const directories = directoriesById.get(id) ?? [];
    if (directories.length === 0) {
      errors.push(`${id}: chapter directory is missing`);
      continue;
    }
    if (directories.length > 1) {
      errors.push(`${id}: multiple chapter directories found (${directories.join(", ")})`);
      continue;
    }

    const dirName = directories[0];
    const dirPath = path.join(REPO_ROOT, dirName);
    const codePath = path.join(dirPath, "code.py");
    const requiredFiles = ["code.py", "README.md", "README.zh.md"];
    const missingFiles = requiredFiles.filter(
      (filename) => !fs.existsSync(path.join(dirPath, filename))
    );

    if (missingFiles.length > 0) {
      errors.push(`${id}: missing ${missingFiles.join(", ")} in ${dirName}`);
      continue;
    }

    chapters.push({ id, dirName, dirPath, codePath });
  }

  if (errors.length > 0 || chapters.length !== VERSION_ORDER.length) {
    throw new Error(
      `Course extraction requires the complete s01-s17 root track:\n- ${errors.join("\n- ")}`
    );
  }

  return chapters;
}

function extractClasses(
  lines: string[]
): { name: string; startLine: number; endLine: number }[] {
  const classes: { name: string; startLine: number; endLine: number }[] = [];
  const classPattern = /^class\s+(\w+)/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(classPattern);
    if (!match) continue;

    const name = match[1];
    const startLine = i + 1;
    let endLine = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (
        lines[j].match(/^class\s/) ||
        lines[j].match(/^def\s/) ||
        (lines[j].match(/^\S/) &&
          lines[j].trim() !== "" &&
          !lines[j].startsWith("#") &&
          !lines[j].startsWith("@"))
      ) {
        endLine = j;
        break;
      }
    }
    classes.push({ name, startLine, endLine });
  }

  return classes;
}

function extractFunctions(
  lines: string[]
): { name: string; signature: string; startLine: number }[] {
  const functions: { name: string; signature: string; startLine: number }[] = [];
  const funcPattern = /^(async\s+)?def\s+(\w+)\((.*?)\)/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(funcPattern);
    if (!match) continue;
    functions.push({
      name: match[2],
      signature: `${match[1] ?? ""}def ${match[2]}(${match[3]})`,
      startLine: i + 1,
    });
  }

  return functions;
}

function assignmentBody(source: string, openIndex: number): string {
  const open = source[openIndex];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let quote = "";
  let triple = false;
  let escaped = false;
  let comment = false;

  for (let index = openIndex; index < source.length; index++) {
    const char = source[index];
    const nextThree = source.slice(index, index + 3);
    if (comment) {
      if (char === "\n") comment = false;
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (triple && nextThree === quote.repeat(3)) {
        quote = "";
        triple = false;
        index += 2;
      } else if (!triple && char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "#") {
      comment = true;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      triple = nextThree === char.repeat(3);
      if (triple) index += 2;
      continue;
    }
    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, index + 1);
    }
  }
  return "";
}

function extractTools(source: string): string[] {
  const assignmentPattern = /^(?:TOOLS|BASE_TOOLS|BUILTIN_TOOLS|SUB_TOOLS|TASK_TOOL|WORKFLOW_TOOL)\s*=\s*([\[{])/gm;
  const toolPattern = /"name"\s*:\s*"([\w-]+)"/g;
  const tools = new Set<string>();
  let assignment;
  while ((assignment = assignmentPattern.exec(source)) !== null) {
    const openIndex = assignment.index + assignment[0].lastIndexOf(assignment[1]);
    const body = assignmentBody(source, openIndex);
    let tool;
    while ((tool = toolPattern.exec(body)) !== null) {
      tools.add(tool[1]);
    }
  }
  return Array.from(tools);
}

function countLoc(lines: string[]): number {
  return lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed !== "" && !trimmed.startsWith("#");
  }).length;
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
}

function titleFromMarkdown(content: string, fallback: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : fallback;
}

function cleanCourseAssets() {
  fs.rmSync(COURSE_ASSETS_DIR, { recursive: true, force: true });
  fs.mkdirSync(COURSE_ASSETS_DIR, { recursive: true });
}

function copyChapterAssets(chapter: ChapterSource): ChapterImage[] {
  const imagesDir = path.join(chapter.dirPath, "images");
  if (!fs.existsSync(imagesDir)) return [];

  const outDir = path.join(COURSE_ASSETS_DIR, chapter.dirName);
  fs.mkdirSync(outDir, { recursive: true });
  fs.cpSync(imagesDir, outDir, { recursive: true });

  return fs
    .readdirSync(imagesDir)
    .filter((filename) => filename.endsWith(".svg"))
    .filter((filename) => !filename.includes(".en.") && !filename.includes(".ja."))
    .sort()
    .map((filename) => ({
      src: `/course-assets/${chapter.dirName}/${filename}`,
      alt: filename.replace(/\.svg$/, "").replace(/-/g, " "),
    }));
}

function localeReadmeName(locale: Locale): string {
  if (locale === "en") return "README.md";
  return `README.${locale}.md`;
}

function rewriteChapterMarkdown(
  content: string,
  chapter: ChapterSource,
  locale: Locale
): string {
  let next = content;

  next = next.replace(
    /^\[English\]\(README\.md\)\s*.\s*\[中文\]\(README\.zh\.md\)\n\n?/m,
    ""
  );

  next = next.replace(
    /(!\[[^\]]*\]\()images\/([^)]+)(\))/g,
    `$1/course-assets/${chapter.dirName}/$2$3`
  );

  next = next.replace(
    /\]\(\.\.\/(s\d{2}_[^)\/]+)\/?\)/g,
    (_match, dirName) => {
      const id = dirToVersionId(dirName);
      return id ? `](/${locale}/${id})` : `](../${dirName}/)`;
    }
  );

  next = next.replace(
    /\]\(\.\/(s\d{2}_[^)\/]+)\/?\)/g,
    (_match, dirName) => {
      const id = dirToVersionId(dirName);
      return id ? `](/${locale}/${id})` : `](./${dirName}/)`;
    }
  );

  // Translation bookkeeping is repository metadata, not course body content.
  next = next.replace(/\n?<!--\s*translation-sync:[\s\S]*?-->\s*$/gm, "");

  return next;
}

function buildRootVersions(chapters: ChapterSource[]): AgentVersion[] {
  const versions: AgentVersion[] = [];
  for (const chapter of chapters) {
    const source = readText(chapter.codePath);
    const lines = source.split("\n");
    const meta = VERSION_META[chapter.id];
    const localTools = extractTools(source);
    const inheritedId = source.match(/^INHERITS_TOOLS_FROM\s*=\s*"(s\d{2})"/m)?.[1];
    const inheritedTools = inheritedId
      ? versions.find((version) => version.id === inheritedId)?.tools ?? []
      : [];

    versions.push({
      id: chapter.id,
      filename: `${chapter.dirName}/code.py`,
      loc: countLoc(lines),
      tools: Array.from(new Set([...inheritedTools, ...localTools])),
      newTools: [] as string[],
      classes: extractClasses(lines),
      functions: extractFunctions(lines),
      layer: meta.layer,
      source,
      images: copyChapterAssets(chapter),
    });
  }
  return versions;
}

function buildRootDocs(chapters: ChapterSource[]): DocContent[] {
  const docs: DocContent[] = [];
  const locales: Locale[] = ["en", "zh"];

  for (const chapter of chapters) {
    for (const locale of locales) {
      const filename = localeReadmeName(locale);
      const filePath = path.join(chapter.dirPath, filename);
      const raw = readText(filePath);
      const content = rewriteChapterMarkdown(raw, chapter, locale);
      docs.push({
        version: chapter.id,
        locale,
        title: titleFromMarkdown(content, filename),
        content,
      });
    }
  }

  return docs;
}

function computeNewTools(versions: AgentVersion[]) {
  for (let i = 0; i < versions.length; i++) {
    const prev = i > 0 ? new Set(versions[i - 1].tools) : new Set<string>();
    versions[i].newTools = versions[i].tools.filter((tool) => !prev.has(tool));
  }
}

function buildDiffs(versions: AgentVersion[]): VersionDiff[] {
  const diffs: VersionDiff[] = [];
  const versionMap = new Map(versions.map((version) => [version.id, version]));

  for (let i = 1; i < LEARNING_PATH.length; i++) {
    const fromId = LEARNING_PATH[i - 1];
    const toId = LEARNING_PATH[i];
    const fromVer = versionMap.get(fromId);
    const toVer = versionMap.get(toId);
    if (!fromVer || !toVer) continue;

    const fromClassNames = new Set(fromVer.classes.map((cls) => cls.name));
    const fromFuncNames = new Set(fromVer.functions.map((fn) => fn.name));
    const fromToolNames = new Set(fromVer.tools);

    diffs.push({
      from: fromId,
      to: toId,
      newClasses: toVer.classes
        .map((cls) => cls.name)
        .filter((name) => !fromClassNames.has(name)),
      newFunctions: toVer.functions
        .map((fn) => fn.name)
        .filter((name) => !fromFuncNames.has(name)),
      newTools: toVer.tools.filter((tool) => !fromToolNames.has(tool)),
      locDelta: toVer.loc - fromVer.loc,
    });
  }

  return diffs;
}

function sortVersions(versions: AgentVersion[]) {
  const orderMap = new Map<string, number>(
    VERSION_ORDER.map((id, index) => [id, index])
  );
  versions.sort(
    (a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
  );
}

function assertExtraction(versions: AgentVersion[], docs: DocContent[]) {
  const expectedIds = new Set<string>(VERSION_ORDER);
  const actualIds = versions.map((version) => version.id);
  const unexpectedIds = actualIds.filter((id) => !expectedIds.has(id));
  const missingIds = VERSION_ORDER.filter((id) => !actualIds.includes(id));

  if (
    versions.length !== VERSION_ORDER.length ||
    unexpectedIds.length > 0 ||
    missingIds.length > 0
  ) {
    throw new Error(
      `Expected exactly s01-s17. Missing: ${missingIds.join(", ") || "none"}; unexpected: ${unexpectedIds.join(", ") || "none"}.`
    );
  }

  const missingDocs = VERSION_ORDER.flatMap((version) =>
    (["en", "zh"] as const)
      .filter(
        (locale) =>
          !docs.some((doc) => doc.version === version && doc.locale === locale)
      )
      .map((locale) => `${version}/${locale}`)
  );

  if (docs.length !== VERSION_ORDER.length * 2 || missingDocs.length > 0) {
    throw new Error(
      `Expected 34 English/Chinese course documents. Missing: ${missingDocs.join(", ") || "none"}.`
    );
  }
}

function main() {
  console.log("Extracting course content...");
  console.log(`  Repo root: ${REPO_ROOT}`);

  const rootChapters = listRootChapters();
  console.log(`  Source: root s01-s17 chapter folders (${rootChapters.length})`);

  cleanCourseAssets();

  const versions = buildRootVersions(rootChapters);
  const docs = buildRootDocs(rootChapters);

  sortVersions(versions);
  computeNewTools(versions);
  assertExtraction(versions, docs);
  const diffs = buildDiffs(versions);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const index: VersionIndex = { versions, diffs };
  fs.writeFileSync(path.join(OUT_DIR, "versions.json"), JSON.stringify(index, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "docs.json"), JSON.stringify(docs, null, 2));

  console.log("\nExtraction complete:");
  console.log(`  ${versions.length} versions`);
  console.log(`  ${diffs.length} diffs`);
  console.log(`  ${docs.length} docs`);
  for (const version of versions) {
    console.log(
      `    ${version.id}: ${version.loc} LOC, ${version.tools.length} tools, ${version.classes.length} classes, ${version.functions.length} functions`
    );
  }
}

main();
