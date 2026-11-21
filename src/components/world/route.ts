import type { Point } from "./masonry";
import { projects } from "../../content/projects";

export const chamberZ = -51;
export const courtyardExtension = 9;
export const hallZ = -88;
export const gateZ = -177;
export const bayDepths = [-3, -7.6, -12.2, -16.8, -21.4, -26, -30.6];

type ProjectSlug = (typeof projects)[number]["slug"];
type NavId = "hero" | "philosophy" | "gallery" | "contact";
export type SceneId =
  | NavId
  | "approach"
  | "observatory"
  | "creator-hall"
  | "precision-hall"
  | "passage"
  | "knowledge-library"
  | "scholar-terrace"
  | `exhibit-${Exclude<ProjectSlug, "pulse">}`;

type Pose = { eye: Point; look: Point };
type Scene = Pose & {
  id: SceneId;
  name: string;
  group: NavId;
  plate: string;
  mobilePlate?: string;
  project?: ProjectSlug;
  mobileAim?: [number, number];
  wide?: boolean;
  shortGate?: boolean;
  via?: Pose[];
};

export const processStages = [
  "Understand",
  "Design",
  "Build",
  "Test",
  "Deploy",
  "Improve",
] as const;

export function projectSceneId(slug: ProjectSlug): SceneId {
  return slug === "pulse" ? "gallery" : `exhibit-${slug}`;
}

export const expansionIds = [
  "creator-hall",
  "precision-hall",
  "knowledge-library",
  "scholar-terrace",
] as const;

const outerRoute: Scene[] = [
  {
    id: "hero",
    name: "The frontier",
    group: "hero",
    plate: "frontier",
    mobilePlate: "mobile-frontier",
    eye: [12, 5.3, 29],
    look: [1, 4.4, -13],
  },
  {
    id: "approach",
    name: "The broken road",
    group: "hero",
    plate: "frontier",
    mobilePlate: "mobile-frontier",
    eye: [5.7, 3.7, 12],
    look: [1.2, 3.6, -15],
  },
  {
    id: "observatory",
    name: "The outer observatory",
    group: "hero",
    plate: "outer-observatory",
    eye: [4.9, 3.6, -11],
    look: [1, 3.45, -30],
  },
  {
    id: "creator-hall",
    name: "Hall of the Creator",
    group: "philosophy",
    plate: "creator-hall",
    mobilePlate: "mobile-creator-hall",
    eye: [3.15, 3.35, -23.2],
    look: [4.55, 3.05, -32.2],
    mobileAim: [1.6, -1.28],
    via: [
      { eye: [3.3, 3.35, -30.8], look: [3.7, 3.65, -43] },
      { eye: [4.85, 3.55, -37.4], look: [2.7, 5.25, -53] },
      { eye: [4.05, 3.65, -44.7], look: [1.8, 4.55, -58] },
    ],
  },
];

const innerRoute: Scene[] = [
  {
    id: "philosophy",
    name: "The armillary",
    group: "philosophy",
    plate: "chamber",
    mobilePlate: "mobile-chamber",
    eye: [4.2, 4.12, chamberZ + 9],
    look: [-1.23, 5.32, chamberZ],
    mobileAim: [1.45, 0],
    via: [
      { eye: [4.22, 3.44, chamberZ - 3.6], look: [0.7, 3.7, -63] },
      { eye: [1.45, 3.14, -61.4], look: [0.3, 3.35, -71] },
    ],
  },
  {
    id: "precision-hall",
    name: "Hall of Precision",
    group: "philosophy",
    plate: "precision-hall",
    mobilePlate: "mobile-precision-hall",
    eye: [0.5, 3.25, -65],
    look: [1.35, 2.55, -71],
    mobileAim: [0.65, -0.62],
    wide: true,
    via: [{ eye: [-0.35, 3.16, -70.7], look: [0.65, 2.5, -77] }],
  },
  {
    id: "passage",
    name: "The passage",
    group: "philosophy",
    plate: "vault-passage",
    eye: [0.25, 3.35, -76.65],
    look: [0.3, 3.1, -87],
    wide: true,
  },
  ...projects.map((project, i): Scene => {
    const z = hallZ + bayDepths[i];
    return {
      id: projectSceneId(project.slug),
      name: project.name,
      project: project.slug,
      group: "gallery",
      plate: "vault",
      mobilePlate: "mobile-vault",
      wide: true,
      mobileAim: [1.35, 0],
      eye: [-1.75, 2.82, z + 4.46],
      look: [0.95, 2.08, z - 0.48],
    };
  }),
  {
    id: "knowledge-library",
    name: "Library of Knowledge",
    group: "gallery",
    plate: "knowledge-library",
    mobilePlate: "mobile-knowledge-library",
    eye: [-0.65, 3.35, -126.5],
    look: [1.4, 3.4, -139.3],
    mobileAim: [0.7, -0.52],
    wide: true,
    via: [{ eye: [0.12, 3.3, -144], look: [0.2, 3.9, -155] }],
  },
  {
    id: "scholar-terrace",
    name: "Astronomer’s Terrace",
    group: "gallery",
    plate: "scholar-terrace",
    mobilePlate: "mobile-scholar-terrace",
    eye: [-0.5, 4.5, -152.5],
    look: [1.1, 4.85, -161.6],
    mobileAim: [1.86, -1.5],
    wide: true,
    via: [{ eye: [-1.5, 4.2, -161], look: [0, 3.65, -173] }],
  },
  {
    id: "contact",
    name: "The final gate",
    group: "contact",
    plate: "journey-gate",
    mobilePlate: "mobile-journey-gate",
    eye: [-0.48, 3.28, gateZ + 7.4],
    look: [-2.35, 3.08, gateZ - 0.5],
    mobileAim: [2.15, -1.1],
    wide: true,
    shortGate: true,
  },
];

function extendPastCourtyard({ eye, look }: Pose): Pose {
  return {
    eye: [eye[0], eye[1], eye[2] - courtyardExtension],
    look: [look[0], look[1], look[2] - courtyardExtension],
  };
}

export const route: Scene[] = [
  ...outerRoute,
  ...innerRoute.map((scene) => ({
    ...scene,
    ...extendPastCourtyard(scene),
    via: scene.via?.map(extendPastCourtyard),
  })),
];

export const sceneById = new Map(route.map((scene) => [scene.id, scene]));
export const destinations: { id: NavId; label: string }[] = [
  { id: "hero", label: "Frontier" },
  { id: "philosophy", label: "Chamber" },
  { id: "gallery", label: "Vault" },
  { id: "contact", label: "Gate" },
];
