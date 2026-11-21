import { expect, test } from "vitest";
import { projects } from "../../src/content/projects";
import { stages } from "../../src/content/profile";

test("the approved roster has seven complete, unique case studies", () => {
  expect(projects.map((project) => project.slug)).toEqual([
    "pulse",
    "minchal",
    "orion",
    "claimpilot",
    "ignition",
    "codesentra",
    "frontend-craft",
  ]);
  for (const item of projects) {
    expect(new URL(item.repository).hostname).toBe("github.com");
    expect(item.description).toHaveLength(2);
    expect(item.features.length).toBeGreaterThan(4);
    expect(item.architecture).toHaveLength(4);
    expect(item.artwork).toBeTruthy();
  }
});
test("the armillary follows the engineering sequence", () => {
  expect(stages.map((stage) => stage.name)).toEqual(["Input", "Understand", "Verify", "Decide"]);
});
