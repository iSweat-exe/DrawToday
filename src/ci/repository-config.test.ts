// @vitest-environment node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const json = (path: string) => JSON.parse(read(path)) as Record<string, unknown>;

type Rule = { type: string; parameters?: Record<string, unknown> };
type Ruleset = {
  name: string;
  target: string;
  enforcement: string;
  conditions: { ref_name: { include: string[] } };
  bypass_actors: unknown[];
  rules: Rule[];
};

describe("vercel.json: deployments only from main", () => {
  const config = json("vercel.json") as {
    git: { deploymentEnabled: Record<string, boolean> };
    ignoreCommand: string;
    crons: { path: string; schedule: string }[];
  };

  it("enables Git deployments for main and disables every other branch", () => {
    expect(config.git.deploymentEnabled).toEqual({ main: true, "**": false });
  });

  /** Runs the ignore command like Vercel: exit 0 = skip the build, exit 1 = build. */
  const ignore = (ref: string | undefined) => {
    const env: Record<string, string> = ref === undefined ? {} : { VERCEL_GIT_COMMIT_REF: ref };
    return spawnSync("sh", ["-c", config.ignoreCommand], { env: env as NodeJS.ProcessEnv }).status;
  };

  it("builds main", () => {
    expect(ignore("main")).toBe(1);
  });

  it.each([
    "feat/design-system",
    "dependabot/npm_and_yarn/next-16.5.0",
    "release-please--branches--main",
    "main-old",
    "Main",
    "",
    "refs/heads/main",
  ])("skips the build of %j", (ref) => {
    expect(ignore(ref)).toBe(0);
  });

  it("skips the build when the branch is unknown", () => {
    expect(ignore(undefined)).toBe(0);
  });

  it("keeps the daily keep-alive cron (the Hobby plan allows one run per day)", () => {
    expect(config.crons).toEqual([{ path: "/api/keep-alive", schedule: "0 6 * * *" }]);
  });
});

describe("branch ruleset (.github/rulesets/main.json)", () => {
  const ruleset = json(".github/rulesets/main.json") as unknown as Ruleset;
  const rule = (type: string) => ruleset.rules.find((item) => item.type === type);

  it("is active and targets the default branch", () => {
    expect(ruleset.target).toBe("branch");
    expect(ruleset.enforcement).toBe("active");
    expect(ruleset.conditions.ref_name.include).toEqual(["~DEFAULT_BRANCH"]);
  });

  it("forbids deleting the branch, force-pushing, and merge commits", () => {
    expect(rule("deletion")).toBeDefined();
    expect(rule("non_fast_forward")).toBeDefined();
    expect(rule("required_linear_history")).toBeDefined();
  });

  it("requires a pull request merged with squash, with the threads resolved", () => {
    expect(rule("pull_request")?.parameters).toMatchObject({
      allowed_merge_methods: ["squash"],
      required_review_thread_resolution: true,
      dismiss_stale_reviews_on_push: true,
    });
  });

  it("does not make a solo maintainer impossible to merge: no approval or code-owner review required", () => {
    expect(rule("pull_request")?.parameters).toMatchObject({
      required_approving_review_count: 0,
      require_code_owner_review: false,
    });
  });

  it("has no bypass actor", () => {
    expect(ruleset.bypass_actors).toEqual([]);
  });

  it("requires exactly the CI jobs that always run on a pull request", () => {
    const required = (
      rule("required_status_checks")?.parameters?.required_status_checks as { context: string }[]
    ).map((check) => check.context);
    const ci = read(".github/workflows/ci.yml");
    const jobNames = [...ci.matchAll(/^ {4}name: (.+)$/gm)].map((match) => match[1]!.trim());
    expect([...required].sort()).toEqual(
      [
        "Conventional Commits",
        "Dependency audit",
        "End-to-end tests",
        "PR title",
        "Quality",
        "Secret scan",
      ].sort(),
    );
    for (const name of required) expect(jobNames, name).toContain(name);
  });

  it("does not require a check that only runs for some files (it would block every other PR)", () => {
    const supabase = read(".github/workflows/supabase.yml");
    expect(supabase).toMatch(/paths:/);
    expect(JSON.stringify(ruleset)).not.toContain("Database tests");
  });
});

describe("tag ruleset (.github/rulesets/tags.json)", () => {
  const ruleset = json(".github/rulesets/tags.json") as unknown as Ruleset;

  it("protects release tags from deletion, rewriting and updates", () => {
    expect(ruleset.target).toBe("tag");
    expect(ruleset.enforcement).toBe("active");
    expect(ruleset.conditions.ref_name.include).toEqual(["refs/tags/v*"]);
    expect(ruleset.rules.map((item) => item.type).sort()).toEqual([
      "deletion",
      "non_fast_forward",
      "update",
    ]);
  });
});

describe("security policy and ownership", () => {
  it("has a security policy that points to private reporting", () => {
    expect(existsSync(join(root, ".github/SECURITY.md"))).toBe(true);
    expect(read(".github/SECURITY.md")).toContain("security/advisories/new");
  });

  it("makes the owner the code owner of sensitive folders", () => {
    const owners = read(".github/CODEOWNERS");
    for (const path of ["/supabase/", "/src/lib/supabase/", "/src/server/", "/.github/"]) {
      expect(owners).toContain(path);
    }
  });

  it("documents every ruleset and the Vercel guard in the setup guide", () => {
    const guide = read("docs/repository-setup.md");
    for (const needle of [
      ".github/rulesets/main.json",
      ".github/rulesets/tags.json",
      "ignoreCommand",
      "deploymentEnabled",
    ]) {
      expect(guide, needle).toContain(needle);
    }
  });
});
