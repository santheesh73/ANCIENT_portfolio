import type { Metadata } from "next";
import Link from "next/link";
import { profile, skills } from "../../content/profile";
import "../../components/archive-pages.css";

export const metadata: Metadata = { title: "About Santheesh S" };
const process = ["Understand", "Design", "Build", "Test", "Deploy", "Improve"];

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="archive-page">
      <section className="archive-hero archive-hero-about">
        <div className="archive-width archive-intro">
          <h1>Santheesh S</h1>
          <p className="archive-role">AI Software Engineer &amp; Full-Stack Developer</p>
          <p>{profile.bio[1]}</p>
          <Link href="/work" className="archive-text-link">
            Explore my work <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <div className="archive-width archive-about">
        <section className="archive-principle" aria-labelledby="principle-title">
          <h2 id="principle-title">
            The model reads.
            <br />
            <em>Code decides.</em>
          </h2>
          <div>
            <p>
              AI handles perception, language understanding, and information extraction.
              Deterministic software handles critical calculations, validation, and business
              decisions.
            </p>
            <ol className="archive-process" aria-label="Engineering process">
              {process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link href="/#philosophy" className="archive-text-link">
              See the armillary in motion <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <div className="archive-about-details">
          <section aria-labelledby="education-title">
            <h2 id="education-title">Education</h2>
            <p className="archive-degree">{profile.degree}</p>
            <p>{profile.institute}</p>
            <p>Expected graduation {profile.graduation}</p>
          </section>
          <section aria-labelledby="stack-title">
            <h2 id="stack-title">Technical toolkit</h2>
            <dl className="archive-skill-list">
              {Object.entries(skills).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <div className="archive-page-end">
          <Link href="/contact" className="archive-text-link">
            Get in touch <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
