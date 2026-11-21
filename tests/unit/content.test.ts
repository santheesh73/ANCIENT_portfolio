import { expect, test } from "vitest";
import { projects } from "../../src/content/projects";
import { stages } from "../../src/content/profile";
import {
  destinations,
  expansionIds,
  projectSceneId,
  route,
  sceneById,
} from "../../src/components/world/route";

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

test("expansion preserves landmark IDs, exhibit order and physical travel", () => {
  expect(new Set(route.map((scene) => scene.id)).size).toBe(route.length);
  expect(route.filter((scene) => scene.project).map((scene) => scene.id)).toEqual(
    projects.map(({ slug }) => projectSceneId(slug)),
  );
  expect(
    route.filter((scene) => expansionIds.some((id) => id === scene.id)).map((scene) => scene.id),
  ).toEqual(expansionIds);
  expect(destinations.every((item) => sceneById.has(item.id))).toBe(true);
  const positions = route
    .flatMap((scene) => [scene, ...(scene.via ?? [])])
    .map((pose) => pose.eye[2]);
  expect(positions.every((z, i) => !i || z < positions[i - 1])).toBe(true);
});
