import Link from "next/link";
import { profile } from "../content/profile";
import { SiteNavigation } from "./site-navigation";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="seal" aria-hidden="true">
          ✦
        </span>
        <span>
          The Archive <i>of</i> Intelligence
        </span>
      </Link>
      <SiteNavigation />
    </header>
  );
}

export function Contact() {
  return (
    <>
      <p className="eyebrow">The final gate</p>
      <h2>
        Let’s build
        <br /> something <em>useful.</em>
      </h2>
      <p>{profile.location}</p>
      <div className="actions">
        <a className="button primary" href={"mailto:" + profile.email}>
          Email Santheesh <span aria-hidden="true">↗</span>
        </a>
        <a className="button" href={profile.github}>
          GitHub ↗
        </a>
        <a className="button" href={profile.linkedin}>
          LinkedIn ↗
        </a>
      </div>
      <p className="motto">Think deeply. Build deliberately. Ship continuously.</p>
    </>
  );
}
