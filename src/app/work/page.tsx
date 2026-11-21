import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "../../content/projects";
import Image from "next/image";
import "../../components/archive-pages.css";

export const metadata: Metadata = { title: "Selected Work" };

export default function WorkPage() {
  return (
    <main id="main" tabIndex={-1} className="archive-page">
      <section className="archive-hero archive-hero-work">
        <div className="archive-width archive-intro">
          <h1>
            The work <em>inside the vault.</em>
          </h1>
          <p>
            Seven projects in AI, reliability, and developer tools. See the problem each one solves,
            how it’s built, and the code behind it.
          </p>
          <Link href="/#gallery" className="archive-text-link">
            Explore the 3D vault <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="archive-width archive-projects" aria-labelledby="projects-title">
        <div className="archive-section-heading">
          <h2 id="projects-title">Project index</h2>
          <span>{projects.length} projects</span>
        </div>
        <ol className="work-index archive-work-index">
          {projects.map((project) => {
            const [name, subtitle] = project.title.split(" — ");
            return (
              <li key={project.slug}>
                <Link
                  href={"/work/" + project.slug}
                  aria-labelledby={project.slug + "-index-title"}
                >
                  <div className="archive-index-art">
                    <Image
                      src={"/exhibits/" + project.slug + ".webp"}
                      alt=""
                      width={464}
                      height={408}
                    />
                  </div>
                  <div className="archive-index-copy">
                    <p className="archive-category">{project.category}</p>
                    <h3 id={project.slug + "-index-title"}>
                      {name}
                      <span>{subtitle}</span>
                    </h3>
                    <p>{project.description[0]}</p>
                  </div>
                  <span className="archive-index-action" aria-hidden="true">
                    Case study <span>↗</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="archive-page-end">
          <Link className="archive-text-link" href="/contact">
            Get in touch <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
