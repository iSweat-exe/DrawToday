// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

type Label = { name: string; color: string; description: string; aliases: string[] };

/** Reads .github/labels.yml, a flat list of one-line `{ name: "…", … }` flow mappings. */
function readLabels(): Label[] {
  return read(".github/labels.yml")
    .split("\n")
    .filter((line) => line.startsWith("- {"))
    .map((line) => {
      const field = (key: string) => new RegExp(`${key}: "([^"]*)"`).exec(line)?.[1] ?? "";
      const aliases = /aliases: \[([^\]]*)\]/.exec(line)?.[1] ?? "";
      return {
        name: field("name"),
        color: field("color"),
        description: field("description"),
        aliases: [...aliases.matchAll(/"([^"]*)"/g)].map((match) => match[1]!),
      };
    });
}

const labels = readLabels();
const names = new Set(labels.map((label) => label.name));

/** Every `"prefix: value"` or known flag written between quotes in a script or a workflow. */
function labelsMentioned(text: string): string[] {
  const code = text
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n");
  return [
    ...code.matchAll(/"((?:type|area|priority|status|size|platform|checklist): [^"$]+)"/g),
  ].map((match) => match[1]!);
}

describe("labels.yml", () => {
  it("is parsed", () => {
    expect(labels.length).toBeGreaterThan(50);
  });

  it("has unique names, aliases that are not labels, GitHub-valid fields", () => {
    expect(names.size).toBe(labels.length);
    for (const label of labels) {
      expect(label.name.length, label.name).toBeLessThanOrEqual(50);
      expect(label.color, label.name).toMatch(/^[0-9a-f]{6}$/);
      expect(label.description, label.name).not.toBe("");
      expect(label.description.length, label.name).toBeLessThanOrEqual(100);
      for (const alias of label.aliases)
        expect(names.has(alias), `${label.name}: ${alias}`).toBe(false);
    }
  });

  it("uses one colour per family so a list stays readable", () => {
    for (const family of ["area", "checklist", "platform"]) {
      const colours = new Set(
        labels.filter((label) => label.name.startsWith(`${family}: `)).map((label) => label.color),
      );
      expect(colours.size, family).toBe(1);
    }
  });
});

describe("labels used elsewhere exist in labels.yml", () => {
  it.each([
    ".github/scripts/auto-label-pr.sh",
    ".github/scripts/auto-label-issue.sh",
    ".github/workflows/auto-label.yml",
  ])("%s", (file) => {
    for (const name of labelsMentioned(read(file))) {
      expect(names.has(name), `${file}: ${name}`).toBe(true);
    }
  });

  it("the flag labels written in auto-label-pr.sh", () => {
    for (const name of ["breaking change", "needs-tests", "needs-docs", "llm-generated"]) {
      expect(read(".github/scripts/auto-label-pr.sh")).toContain(`"${name}"`);
      expect(names.has(name), name).toBe(true);
    }
  });

  it("every label of labeler.yml", () => {
    const keys = [
      ...read(".github/labeler.yml").matchAll(/^"?([^\s":#][^":]*(?:: [^":]+)?)"?:\s*$/gm),
    ].map((match) => match[1]!);
    expect(keys.length).toBeGreaterThan(10);
    for (const key of keys) expect(names.has(key), key).toBe(true);
  });

  it("the labels Dependabot applies", () => {
    const dependabot = read(".github/dependabot.yml");
    const used = [...dependabot.matchAll(/labels: \[([^\]]*)\]/g)].flatMap((match) =>
      [...match[1]!.matchAll(/"([^"]*)"/g)].map((item) => item[1]!),
    );
    expect(used.length).toBeGreaterThan(0);
    for (const name of used) expect(names.has(name), name).toBe(true);
  });

  it("the type labels cover every Conventional Commit type of commitlint", () => {
    const script = read(".github/scripts/auto-label-pr.sh");
    for (const type of "feat fix docs refactor test chore perf ci build revert style".split(" ")) {
      expect(script, type).toMatch(new RegExp(`\\b${type}\\b`));
    }
  });
});

describe("issue forms, issue script and labels stay in sync", () => {
  const forms = readdirSync(join(root, ".github/ISSUE_TEMPLATE")).filter(
    (file) => file !== "config.yml",
  );

  /** The options of the dropdown whose `label:` is `label`. */
  function options(form: string, label: string): string[] {
    const text = read(`.github/ISSUE_TEMPLATE/${form}`);
    const start = text.indexOf(`label: ${label}`);
    if (start < 0) return [];
    const block = text.slice(text.indexOf("options:", start));
    const lines = block.split("\n").slice(1);
    const result: string[] = [];
    for (const line of lines) {
      const match = /^\s+- (.+)$/.exec(line);
      if (!match) break;
      result.push(match[1]!.trim());
    }
    return result;
  }

  it("has the three forms", () => {
    expect(forms.sort()).toEqual(["bug.yml", "feature.yml", "llm-task.yml"]);
  });

  it.each(["bug.yml", "feature.yml", "llm-task.yml"])(
    "%s: every Area option is a label and is handled by the script",
    (form) => {
      const area = options(form, "Area");
      expect(area.length).toBeGreaterThan(10);
      const script = read(".github/scripts/auto-label-issue.sh");
      for (const value of area) {
        expect(names.has(`area: ${value}`), value).toBe(true);
        expect(script, value).toMatch(new RegExp(`\\b${value}\\b`));
      }
    },
  );

  it("the three forms offer the same areas", () => {
    const [first, ...others] = forms.map((form) => options(form, "Area"));
    for (const other of others) expect(other).toEqual(first);
  });

  it("every area label of labels.yml is a form option", () => {
    const area = new Set(options("bug.yml", "Area"));
    for (const label of labels.filter((item) => item.name.startsWith("area: "))) {
      expect(area.has(label.name.slice("area: ".length)), label.name).toBe(true);
    }
  });
});

describe("PR template and workflow", () => {
  it("the LLM checkbox sentence read by the script is in the template", () => {
    expect(read(".github/pull_request_template.md")).toContain(
      "- [ ] This PR was (partly) generated by an LLM",
    );
    expect(read(".github/scripts/auto-label-pr.sh")).toContain(
      "This PR was \\(partly\\) generated by an LLM",
    );
  });

  it("the template has the Checklist item heading that the script reads", () => {
    expect(read(".github/pull_request_template.md")).toMatch(/^## Checklist item$/m);
    expect(read(".github/scripts/auto-label-pr.sh")).toContain("## Checklist item");
  });

  it("the workflow runs on every event that can change a label and passes every variable", () => {
    const workflow = read(".github/workflows/auto-label.yml");
    for (const event of [
      "opened",
      "edited",
      "synchronize",
      "reopened",
      "ready_for_review",
      "converted_to_draft",
    ]) {
      expect(workflow, event).toContain(event);
    }
    for (const variable of ["PR_NUMBER", "PR_TITLE", "PR_BODY", "PR_DRAFT", "REPO", "GH_TOKEN"]) {
      expect(workflow, variable).toContain(`${variable}:`);
    }
  });

  it("the workflow never checks out the code of the pull request", () => {
    const workflow = read(".github/workflows/auto-label.yml");
    expect(workflow).not.toMatch(/ref:\s*\$\{\{\s*github\.(event\.pull_request\.head|head_ref)/);
    expect(workflow).toContain("pull_request_target");
  });
});
