"use client";

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { profile, skills, stages } from "../content/profile";
import { projects } from "../content/projects";
import { Contact } from "./site";
import {
  destinations,
  processStages,
  projectSceneId,
  route,
  sceneById,
  type SceneId,
} from "./world/route";
import "./journey.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const WorldCanvas = dynamic(() => import("./world/canvas"), { ssr: false });

class RenderBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Journey() {
  const scope = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stop, setStop] = useState<SceneId>("hero");
  const [stage, setStage] = useState(1);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const failed = useCallback(() => setReady(false), []);
  const active = sceneById.get(stop)!;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      if (preference.matches) {
        setReady(false);
        setAllowed(false);
        return;
      }
      frame = requestAnimationFrame(() => {
        try {
          const probe = document.createElement("canvas").getContext("webgl2");
          setAllowed(Boolean(probe));
          probe?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {
          setAllowed(false);
        }
      });
    };
    update();
    preference.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", update);
    };
  }, []);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const stops = route.map(({ id }) => document.getElementById(id));
      if (stops.some((section) => !section || !root.contains(section))) return;
      const rail = root.querySelector<HTMLElement>(".route-progress");
      let offsets: number[] = [];
      const measure = () => {
        offsets = stops.map((section) => section!.offsetTop);
      };
      const synchronize = (y: number) => {
        const scroll = Math.max(0, y + 2);
        let index = 0;
        while (index < offsets.length - 1 && scroll >= offsets[index + 1]) index++;
        const fraction =
          index === offsets.length - 1
            ? 0
            : Math.min(1, (scroll - offsets[index]) / (offsets[index + 1] - offsets[index]));
        progress.current = index + fraction;
        if (rail)
          rail.style.setProperty("--route-progress", String(progress.current / (route.length - 1)));
        setStop(route[fraction > 0.67 ? index + 1 : index].id);
      };
      measure();
      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => synchronize(self.scroll()),
        onRefresh: (self) => {
          measure();
          synchronize(self.scroll());
        },
      });
      synchronize(trigger.scroll());
    },
    { scope },
  );

  return (
    <main className="journey expedition" id="main" tabIndex={-1} ref={scope}>
      <div
        className="backdrop"
        data-shot={active.id}
        data-artwork={ready ? "live" : "still"}
        data-plate={active.plate}
        data-mobile-plate={active.mobilePlate}
        style={
          {
            "--scene-plate": "url(/plates/" + active.plate + ".webp)",
            "--scene-plate-mobile": active.mobilePlate
              ? "url(/plates/" + active.mobilePlate + ".webp)"
              : undefined,
          } as CSSProperties
        }
        aria-hidden="true"
      >
        <div className="scene-still" />
        {allowed && (
          <RenderBoundary onError={failed}>
            <WorldCanvas
              stage={stage}
              progress={progress}
              checkpoint={stop}
              motion={!paused}
              ready={setReady}
              failed={failed}
            />
          </RenderBoundary>
        )}
      </div>

      <section
        className="landmark expedition-opening"
        id="hero"
        data-landmark
        aria-labelledby="expedition-title"
      >
        <div className="opening-copy">
          <h1 id="expedition-title">
            The Archive
            <br />
            <em>of Intelligence</em>
          </h1>
          <p className="opening-byline">
            {profile.name} <span aria-hidden="true">·</span> AI Software Engineer
          </p>
          <a className="expedition-link" href="#approach">
            Enter the frontier <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark roadside"
        id="approach"
        data-landmark
        aria-labelledby="approach-title"
      >
        <div className="landmark-copy">
          <h2 id="approach-title">The broken road</h2>
          <p>
            The empire fell, but its road still leads to a mountain observatory. Inside, seven
            instruments hold records of the systems that once kept it running.
          </p>
          <a className="expedition-link" href="#observatory">
            Follow the road <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark observatory-stop"
        id="observatory"
        data-landmark
        aria-labelledby="observatory-title"
      >
        <div className="landmark-copy">
          <h2 id="observatory-title">A signal in the ruins</h2>
          <p>
            The outer observatory still catches the light. Follow the road beneath its arch to reach
            the archive.
          </p>
          <a className="expedition-link" href="#creator-hall">
            Enter the creator hall <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark creator-stop"
        id="creator-hall"
        data-landmark
        aria-labelledby="creator-title"
      >
        <div className="landmark-copy">
          <h2 id="creator-title">
            Behind the <em>systems.</em>
          </h2>
          <p className="artifact-subtitle">Building intelligence with purpose.</p>
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <a className="expedition-link" href="#philosophy">
            Enter the chamber <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark armillary-stop"
        id="philosophy"
        data-landmark
        aria-labelledby="armillary-title"
      >
        <div className="landmark-copy">
          <h2 id="armillary-title">
            The model reads.
            <br />
            <em>Code decides.</em>
          </h2>
          <p>
            The armillary turns an observation into a decision. I build AI systems the same way:
            models interpret signals, code verifies them.
          </p>
          <div className="stages" role="group" aria-label="Armillary stages">
            {stages.map((step, index) => (
              <button
                key={step.name}
                type="button"
                aria-pressed={index === stage}
                onClick={() => setStage(index)}
              >
                {step.name}
              </button>
            ))}
          </div>
          <p className="stage-description" aria-live="polite">
            {stages[stage].description}
          </p>
          <a className="expedition-link" href="#precision-hall">
            Continue to the Hall of Precision <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark precision-stop"
        id="precision-hall"
        data-landmark
        aria-labelledby="precision-title"
      >
        <div className="landmark-copy">
          <h2 id="precision-title">
            From idea to <em>engineered system.</em>
          </h2>
          <p>
            Six instruments trace the work from understanding a problem to improving the system
            after it ships.
          </p>
          <ol className="precision-process">
            {processStages.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ol>
          <a className="expedition-link" href="#passage">
            Continue to the vault passage <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark passage-stop"
        id="passage"
        data-landmark
        aria-labelledby="passage-title"
      >
        <div className="landmark-copy">
          <h2 id="passage-title">The vault is open</h2>
          <p>
            Seven instruments line the vault. Each leads to a project, from incident response to
            private, on-device AI.
          </p>
          <a className="expedition-link" href="#gallery">
            Inspect the first instrument <span aria-hidden="true">↓</span>
          </a>
          <Link className="expedition-link" href="/work">
            Browse all case studies <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {projects.map((project, i) => {
        const landmark = projectSceneId(project.slug);
        const nextProject = projects[i + 1];
        return (
          <section
            className="landmark artifact-stop"
            id={landmark}
            data-landmark
            key={project.slug}
            aria-labelledby={project.slug + "-title"}
          >
            <div className="landmark-copy">
              <h2 id={project.slug + "-title"}>{project.title.split(" — ")[0]}</h2>
              <p className="artifact-subtitle">{project.title.split(" — ")[1]}</p>
              <p>{project.description[0]}</p>
              <div className="artifact-actions">
                <Link className="expedition-link" href={"/work/" + project.slug}>
                  Read case study <span aria-hidden="true">↗</span>
                </Link>
                <a
                  className="quiet-action"
                  href={
                    "#" + (nextProject ? projectSceneId(nextProject.slug) : "knowledge-library")
                  }
                >
                  {nextProject ? "Next instrument" : "Continue to the library"}{" "}
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </section>
        );
      })}

      <section
        className="landmark library-stop"
        id="knowledge-library"
        data-landmark
        aria-labelledby="library-title"
      >
        <div className="landmark-copy">
          <h2 id="library-title">
            The tools behind <em>the creations.</em>
          </h2>
          <dl className="library-skills">
            {Object.entries(skills).map(([category, toolkit]) => (
              <div key={category}>
                <dt>{category}</dt>
                <dd>{toolkit}</dd>
              </div>
            ))}
          </dl>
          <a className="expedition-link" href="#scholar-terrace">
            Ascend to the terrace <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark terrace-stop"
        id="scholar-terrace"
        data-landmark
        aria-labelledby="terrace-title"
      >
        <div className="landmark-copy">
          <h2 id="terrace-title">
            The <em>foundation.</em>
          </h2>
          <p className="artifact-subtitle">{profile.degree}</p>
          <p>
            {profile.institute}
            <br />
            Expected graduation {profile.graduation}
          </p>
          <a className="expedition-link" href="#contact">
            To the final gate <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section
        className="landmark final-stop"
        id="contact"
        data-landmark
        aria-labelledby="gate-title"
      >
        <div className="landmark-copy">
          <p className="route-outro">The archive is open again. What should we build next?</p>
          <Contact />
        </div>
      </section>

      <div className="route-progress" aria-hidden="true" />
      <aside className="route-controls" aria-label="Expedition controls">
        <span className="route-location" aria-hidden="true">
          {active.name}
        </span>
        <nav aria-label="Journey landmarks">
          {destinations.map((item) => (
            <a
              key={item.id}
              href={"#" + item.id}
              aria-current={active.group === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        {ready && (
          <button
            type="button"
            className="motion-control"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        )}
      </aside>
    </main>
  );
}
