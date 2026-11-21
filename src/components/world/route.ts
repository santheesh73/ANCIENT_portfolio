import type { Point } from "./masonry";
import { projects } from "../../content/projects";

export const chamberZ = -32;
export const hallZ = -53;
export const bayDepths = [-3, -7.6, -12.2, -16.8, -21.4, -26, -30.6];

type Stop = { id: string; name: string; eye: Point; look: Point };
export const route: Stop[] = [
  { id: "hero", name: "The frontier", eye: [12, 5.3, 29], look: [1, 4.4, -13] },
  { id: "approach", name: "The broken road", eye: [5.7, 3.7, 12], look: [1.2, 3.6, -15] },
  { id: "observatory", name: "The outer observatory", eye: [4.9, 3.6, -11], look: [1, 3.45, -30] },
  { id: "philosophy", name: "The armillary", eye: [4.2, 4.12, -23], look: [-1.23, 5.32, -32] },
  { id: "passage", name: "The passage", eye: [4.25, 3.35, -35.7], look: [0.3, 3.1, -48] },
  ...projects.map((project, i): Stop => {
    const z = hallZ + bayDepths[i];
    return {
      id: i === 0 ? "gallery" : "exhibit-" + project.slug,
      name: project.name,
      eye: [-1.75, 2.82, z + 4.46],
      look: [0.95, 2.08, z - 0.48],
    };
  }),
  { id: "contact", name: "The final gate", eye: [-0.48, 3.28, -87.6], look: [-2.35, 3.08, -95.5] },
];
