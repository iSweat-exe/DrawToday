// @vitest-environment node
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = join(process.cwd(), ".github/scripts/auto-label-pr.sh");

/** A stand-in for the GitHub CLI: answers from environment variables and records `pr edit` calls. */
const GH_STUB = `#!/usr/bin/env bash
case "$1 $2" in
  "pr view") if [ -n "$STUB_LABELS" ]; then printf '%s\\n' "$STUB_LABELS"; fi ;;
  "api repos/"*) if [ -n "$STUB_FILES" ]; then printf '%s\\n' "$STUB_FILES"; fi ;;
  "pr edit") printf '%s\\n' "$*" >> "$STUB_LOG" ;;
  *) echo "unexpected gh call: $*" >&2; exit 1 ;;
esac
`;

type File = [name: string, additions: number, deletions: number];
type Input = {
  title: string;
  body?: string;
  draft?: boolean;
  labels?: string[];
  files: File[];
};
type Result = { add: string[]; remove: string[]; edited: boolean; stdout: string };

const directories: string[] = [];

function run({ title, body = "", draft = false, labels = [], files }: Input): Result {
  const directory = mkdtempSync(join(tmpdir(), "auto-label-"));
  directories.push(directory);
  const gh = join(directory, "gh");
  writeFileSync(gh, GH_STUB);
  chmodSync(gh, 0o755);
  const log = join(directory, "calls.log");
  const result = spawnSync("bash", [SCRIPT], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${directory}:${process.env.PATH ?? ""}`,
      GH_TOKEN: "test",
      REPO: "owner/repo",
      PR_NUMBER: "1",
      PR_TITLE: title,
      PR_BODY: body,
      PR_DRAFT: String(draft),
      STUB_LABELS: labels.join("\n"),
      STUB_FILES: files.map(([name, a, d]) => `${name}\t${a}\t${d}`).join("\n"),
      STUB_LOG: log,
    },
  });
  expect(result.stderr, "script errors").toBe("");
  expect(result.status).toBe(0);
  const call = existsSync(log) ? readFileSync(log, "utf8") : "";
  const collect = (flag: string) =>
    [...call.matchAll(new RegExp(`--${flag} (.+?)(?= --(?:add|remove)-label |\\n|$)`, "g"))].map(
      (match) => match[1]!,
    );
  return {
    add: collect("add-label"),
    remove: collect("remove-label"),
    edited: call !== "",
    stdout: result.stdout,
  };
}

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

const code: File = ["src/lib/zoom.ts", 20, 0];
const test: File = ["src/lib/zoom.test.ts", 20, 0];
const doc: File = ["docs/design-system.md", 10, 0];

describe("auto-label-pr: type and breaking change", () => {
  it.each([
    ["feat(ui): add a sheet", "type: feature"],
    ["fix(pwa): offline page", "type: bug"],
    ["docs: explain the setup", "type: docs"],
    ["refactor(lib): split zoom", "type: refactor"],
    ["perf: lighter images", "type: perf"],
    ["test(ui): more tests", "type: test"],
    ["build(deps): bump react", "type: build"],
    ["ci: cache playwright", "type: ci"],
    ["chore: tidy", "type: chore"],
    ["style: format", "type: chore"],
    ["revert: undo", "type: chore"],
  ])("%s -> %s", (title, label) => {
    expect(run({ title, files: [code, test] }).add).toContain(label);
  });

  it("does not guess a type from a title that is not a Conventional Commit", () => {
    const { add } = run({ title: "Update stuff", files: [code, test] });
    expect(add.filter((label) => label.startsWith("type:"))).toEqual([]);
  });

  it("replaces a wrong type label", () => {
    const { add, remove } = run({
      title: "fix: crash",
      labels: ["type: feature"],
      files: [code, test],
    });
    expect(add).toContain("type: bug");
    expect(remove).toContain("type: feature");
  });

  it("flags a breaking change with `!` and removes the flag when it is gone", () => {
    expect(run({ title: "feat(api)!: new shape", files: [code, test] }).add).toContain(
      "breaking change",
    );
    expect(
      run({ title: "feat(api): new shape", labels: ["breaking change"], files: [code, test] })
        .remove,
    ).toContain("breaking change");
  });
});

describe("auto-label-pr: size", () => {
  it.each([
    [9, "XS"],
    [10, "S"],
    [49, "S"],
    [50, "M"],
    [149, "M"],
    [150, "L"],
    [399, "L"],
    [400, "XL"],
  ])("%i changed lines -> size: %s", (lines, size) => {
    const { add } = run({ title: "chore: x", files: [["README.md", lines, 0]] });
    expect(add).toContain(`size: ${size}`);
  });

  it("counts additions and deletions, and ignores generated files", () => {
    const { add } = run({
      title: "build(deps): bump",
      files: [
        ["package.json", 3, 3],
        ["package-lock.json", 5000, 4000],
        ["CHANGELOG.md", 100, 0],
        ["src/lib/database.types.ts", 800, 0],
        [".release-please-manifest.json", 1, 1],
      ],
    });
    expect(add).toContain("size: XS");
  });

  it("moves the size label when the PR grows", () => {
    const { add, remove } = run({
      title: "chore: x",
      labels: ["size: XS"],
      files: [["README.md", 120, 0]],
    });
    expect(add).toContain("size: M");
    expect(remove).toEqual(["size: XS"]);
  });
});

describe("auto-label-pr: tests and docs reminders", () => {
  it("asks for tests when a feat, fix or perf changes code only", () => {
    for (const type of ["feat", "fix", "perf"]) {
      expect(run({ title: `${type}: x`, files: [code, doc] }).add).toContain("needs-tests");
    }
  });

  it("does not ask for tests for a refactor, or when a unit or e2e test is touched", () => {
    expect(run({ title: "refactor: x", files: [code] }).add).not.toContain("needs-tests");
    expect(run({ title: "fix: x", files: [code, test] }).add).not.toContain("needs-tests");
    expect(run({ title: "fix: x", files: [code, ["e2e/a.spec.ts", 5, 0]] }).add).not.toContain(
      "needs-tests",
    );
    expect(
      run({ title: "fix: x", files: [code, ["supabase/tests/rls.sql", 5, 0]] }).add,
    ).not.toContain("needs-tests");
  });

  it("removes needs-tests once tests are added", () => {
    const { remove } = run({
      title: "fix: x",
      labels: ["needs-tests"],
      files: [code, test],
    });
    expect(remove).toContain("needs-tests");
  });

  it("asks for docs for a feat that changes code without docs", () => {
    expect(run({ title: "feat: x", files: [code, test] }).add).toContain("needs-docs");
    expect(run({ title: "feat: x", files: [code, test, doc] }).add).not.toContain("needs-docs");
    expect(run({ title: "fix: x", files: [code, test] }).add).not.toContain("needs-docs");
    expect(
      run({ title: "feat: x", labels: ["needs-docs"], files: [code, test, ["CLAUDE.md", 1, 0]] })
        .remove,
    ).toContain("needs-docs");
  });

  it("treats a migration as code", () => {
    expect(
      run({ title: "feat: x", files: [["supabase/migrations/20261010_a.sql", 10, 0]] }).add,
    ).toEqual(expect.arrayContaining(["needs-tests", "needs-docs"]));
  });
});

describe("auto-label-pr: area docs", () => {
  it("is set when every file is documentation", () => {
    const { add } = run({
      title: "docs: guide",
      files: [doc, ["README.md", 2, 0], [".dev/checklist-v1.0.0-organisation.md", 1, 1]],
    });
    expect(add).toContain("area: docs");
  });

  it("is not set when documentation comes with code, tests or config", () => {
    for (const other of [code, test, [".github/labeler.yml", 3, 0] as File]) {
      expect(run({ title: "docs: x", files: [doc, other] }).add).not.toContain("area: docs");
    }
  });

  it("is removed when a PR stops being docs only", () => {
    expect(run({ title: "docs: x", labels: ["area: docs"], files: [doc, code] }).remove).toContain(
      "area: docs",
    );
  });

  it("ignores generated files when deciding", () => {
    expect(run({ title: "docs: x", files: [doc, ["package-lock.json", 5, 5]] }).add).toContain(
      "area: docs",
    );
  });
});

describe("auto-label-pr: checklist", () => {
  const body = (items: string) =>
    `## Summary\n\nx\n\n## Checklist item\n\n<!-- Example: A-015 -->\n${items}\n\n## Definition of Done\n\n- [ ] ok\n`;

  it("reads A-xxx from the Checklist item section", () => {
    expect(run({ title: "feat: x", body: body("A-088"), files: [code, test] }).add).toContain(
      "checklist: application",
    );
  });

  it("reads O-xxx, and both when both are written", () => {
    expect(run({ title: "ci: x", body: body("O-031"), files: [doc] }).add).toContain(
      "checklist: organisation",
    );
    const both = run({ title: "ci: x", body: body("A-001 and O-002"), files: [doc] }).add;
    expect(both).toEqual(
      expect.arrayContaining(["checklist: application", "checklist: organisation"]),
    );
  });

  it("ignores the example in the HTML comment of the template and ids elsewhere in the body", () => {
    const { add } = run({
      title: "feat: x",
      body: "## Summary\n\nSee A-010 for context.\n\n## Checklist item\n\n<!-- Example: A-015\nO-099 -->\n\n## Notes\n\nO-005\n",
      files: [code, test],
    });
    expect(add.filter((label) => label.startsWith("checklist:"))).toEqual([]);
  });

  it("does not match ids glued to other words or longer numbers", () => {
    const { add } = run({
      title: "feat: x",
      body: body("DATA-123 and A-1234 and XA-100"),
      files: [code, test],
    });
    expect(add.filter((label) => label.startsWith("checklist:"))).toEqual([]);
  });

  it("works with Windows line endings", () => {
    const crlf = body("A-042").replaceAll("\n", "\r\n");
    expect(run({ title: "feat: x", body: crlf, files: [code, test] }).add).toContain(
      "checklist: application",
    );
  });

  it("also reads the checklist file that the diff touches", () => {
    const { add } = run({
      title: "docs: tick",
      body: "",
      files: [[".dev/checklist-v1.0.0-application.md", 1, 1]],
    });
    expect(add.filter((label) => label.startsWith("checklist:"))).toEqual([
      "checklist: application",
    ]);
  });

  it("removes a checklist label whose id was deleted from the body", () => {
    expect(
      run({
        title: "feat: x",
        body: body("A-001"),
        labels: ["checklist: organisation"],
        files: [code, test],
      }).remove,
    ).toContain("checklist: organisation");
  });
});

describe("auto-label-pr: status", () => {
  it("a draft is in progress", () => {
    const { add } = run({ title: "feat: x", draft: true, files: [code, test] });
    expect(add).toContain("status: in-progress");
    expect(add).not.toContain("status: needs-review");
  });

  it("a PR ready for review needs a review", () => {
    const { add } = run({ title: "feat: x", files: [code, test] });
    expect(add).toContain("status: needs-review");
  });

  it("switches from in progress to needs review when the draft is published", () => {
    const { add, remove } = run({
      title: "feat: x",
      labels: ["status: in-progress"],
      files: [code, test],
    });
    expect(add).toContain("status: needs-review");
    expect(remove).toContain("status: in-progress");
  });

  it("switches back when the PR is converted to a draft", () => {
    const { add, remove } = run({
      title: "feat: x",
      draft: true,
      labels: ["status: needs-review"],
      files: [code, test],
    });
    expect(add).toContain("status: in-progress");
    expect(remove).toContain("status: needs-review");
  });

  it("never touches a blocked PR", () => {
    const { add, remove } = run({
      title: "feat: x",
      labels: ["status: blocked"],
      files: [code, test],
    });
    expect([...add, ...remove].filter((label) => label.startsWith("status:"))).toEqual([]);
  });
});

describe("auto-label-pr: LLM disclosure", () => {
  const line =
    "- [x] This PR was (partly) generated by an LLM and has been reviewed line by line by a human";

  it("adds llm-generated when the box is ticked, with either case of x", () => {
    expect(run({ title: "feat: x", body: line, files: [code, test] }).add).toContain(
      "llm-generated",
    );
    expect(
      run({ title: "feat: x", body: line.replace("[x]", "[X]"), files: [code, test] }).add,
    ).toContain("llm-generated");
  });

  it("does nothing when the box is not ticked, and never removes the label", () => {
    const unticked = run({
      title: "feat: x",
      body: line.replace("[x]", "[ ]"),
      labels: ["llm-generated"],
      files: [code, test],
    });
    expect(unticked.add).not.toContain("llm-generated");
    expect(unticked.remove).not.toContain("llm-generated");
  });
});

describe("auto-label-pr: robustness", () => {
  it("is idempotent: no edit when the labels are already right", () => {
    const first = run({ title: "docs: guide", draft: true, files: [doc] });
    const second = run({
      title: "docs: guide",
      draft: true,
      labels: first.add,
      files: [doc],
    });
    expect(second.edited).toBe(false);
    expect(second.stdout).toContain("Labels already up to date.");
  });

  it("treats the title and the body as data, never as commands", () => {
    const evil = "feat: $(touch /tmp/pwned-by-title) `touch /tmp/pwned-by-title`";
    const { add } = run({ title: evil, body: "$(exit 1)\n`false`", files: [code, test] });
    expect(add).toContain("type: feature");
    expect(existsSync("/tmp/pwned-by-title")).toBe(false);
  });

  it("copes with an empty diff", () => {
    expect(run({ title: "chore: empty", files: [] }).add).toContain("size: XS");
  });

  it("copes with file names that contain spaces", () => {
    expect(run({ title: "docs: x", files: [["docs/a b.md", 1, 0]] }).add).toContain("area: docs");
  });
});
