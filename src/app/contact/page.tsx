import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "../../content/profile";
import "../../components/archive-pages.css";

export const metadata: Metadata = { title: "Contact Santheesh S" };

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="archive-page archive-contact">
      <section className="archive-hero archive-hero-contact">
        <div className="archive-width archive-intro">
          <h1>
            Let’s build
            <br /> something <em>useful.</em>
          </h1>
          <p>Tell me what you’re working on, what’s getting in the way, and where I can help.</p>
          <a className="button primary" href={"mailto:" + profile.email}>
            Email Santheesh <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <div className="archive-width archive-contact-directory">
        <section aria-labelledby="connect-title">
          <h2 id="connect-title">Get in touch</h2>
          <dl className="archive-directory">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={"mailto:" + profile.email}>
                  {profile.email} <span aria-hidden="true">↗</span>
                </a>
              </dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>
                <a href={profile.github}>
                  santheesh73 <span aria-hidden="true">↗</span>
                </a>
              </dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                <a href={profile.linkedin}>
                  Santheesh S <span aria-hidden="true">↗</span>
                </a>
              </dd>
            </div>
          </dl>
        </section>
        <aside className="archive-contact-note" aria-label="Location and project links">
          <p className="archive-location">{profile.location}</p>
          <Link href="/work" className="archive-text-link">
            Browse project case studies <span aria-hidden="true">↗</span>
          </Link>
        </aside>
      </div>
    </main>
  );
}
