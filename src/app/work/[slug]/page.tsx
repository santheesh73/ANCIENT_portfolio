import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { projects } from "../../../content/projects";

type Route = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Route): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: projects.find((project) => project.slug === slug)?.title ?? "Project unavailable",
  };
}

export default async function CaseStudy({ params }: Route) {
  const { slug } = await params;
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  const next = projects[(index + 1) % projects.length];
  const previous = projects[(index + projects.length - 1) % projects.length];
  return (
    <main id="main" tabIndex={-1} className="editorial">
      <div className="case-lead">
        <div className="reading">
          <Link className="crumb" href="/work">
            ← All projects
          </Link>
          <p className="eyebrow">{project.category}</p>
          <h1>{project.title}</h1>
          <p>{project.description[0]}</p>
          <div className="actions">
            <a className="button primary" href={project.repository}>
              Repository ↗
            </a>
            {project.demo && (
              <a className="button" href={project.demo}>
                Live demo ↗
              </a>
            )}
          </div>
        </div>
        <figure>
          <Image
            className="case-exhibit"
            src={"/exhibits/" + project.slug + ".webp"}
            alt=""
            width={464}
            height={408}
            priority
          />
          <figcaption>3D exhibit · {project.artwork}</figcaption>
        </figure>
      </div>
      <div className="case-body">
        <section>
          <h2>Problem</h2>
          <p>{project.problem}</p>
        </section>
        <section>
          <h2>Solution</h2>
          {project.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <section>
          <h2>Architecture</h2>
          <ol className="flow">
            {project.architecture.map((part) => (
              <li key={part}>{part}</li>
            ))}
          </ol>
          <p>{project.detail}</p>
          <a className="crumb" href={project.repository + "#readme"}>
            Engineering notes on GitHub ↗
          </a>
        </section>
        <section>
          <h2>Key features</h2>
          <ul>
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Technology</h2>
          <p>{project.stack.join(" · ")}</p>
        </section>
      </div>
      <nav className="case-nav" aria-label="Adjacent projects">
        <Link href={"/work/" + previous.slug}>← {previous.name}</Link>
        <Link href={"/work/" + next.slug}>{next.name} →</Link>
      </nav>
    </main>
  );
}
