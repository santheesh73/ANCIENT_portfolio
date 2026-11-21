"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { profile, stages } from "../content/profile";
import { projects } from "../content/projects";
import { Contact } from "./site";
import { route } from "./world/route";
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

const destinations = [route[0], route[3], route[5], route[route.length - 1]];

export function Journey() {
  const scope = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stop, setStop] = useState(0);
  const [stage, setStage] = useState(1);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const failed = useCallback(() => setReady(false), []);
  const active = route[stop];

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
      const stops = Array.from(root.querySelectorAll<HTMLElement>("[data-landmark]"));
      const rail = root.querySelector<HTMLElement>(".route-progress");
      let offsets: number[] = [];
      const measure = () => {
        offsets = stops.map((section) => section.offsetTop);
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
        setStop(fraction > 0.67 ? index + 1 : index);
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
            the armillary.
          </p>
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
        const landmark = route[i + 5];
        return (
          <section
            className="landmark artifact-stop"
            id={landmark.id}
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
                <a className="quiet-action" href={"#" + route[i + 6].id}>
                  {i + 1 === projects.length ? "To the final gate" : "Next instrument"}{" "}
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </section>
        );
      })}

      <section className="landmark final-stop" id="contact" data-landmark aria-label="Contact">
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
          {destinations.map((item, i) => (
            <a
              key={item.id}
              href={"#" + item.id}
              aria-current={
                stop >= route.indexOf(item) &&
                (i === destinations.length - 1 || stop < route.indexOf(destinations[i + 1]))
                  ? "location"
                  : undefined
              }
            >
              {["Frontier", "Chamber", "Vault", "Gate"][i]}
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
