import Link from "next/link";

const links = [
  ["/", "Home"], ["/ocean", "Ocean"], ["/arcade", "Arcade"], ["/magic-shop", "Magic"], ["/keepsakes", "Saved"],
] as const;

function NavLinks() {
  return <ul>{links.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>;
}

export function Header() {
  return <><a className="skip" href="#main">Skip to content</a><header className="site-header"><Link href="/">✦ The Little Boraverse</Link><nav className="desktop-nav" aria-label="Desktop navigation"><NavLinks /></nav></header></>;
}

export function Footer() {
  return <><footer><p>Unofficial ARMY-made fan project · Bangkok 2026. Not affiliated with BTS, BIGHIT MUSIC, HYBE, or the venue.</p><p><Link href="/about">About</Link> · <Link href="/privacy">Privacy</Link></p></footer><nav className="mobile-nav" aria-label="Main navigation"><NavLinks /></nav></>;
}

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return <><h1>{title}</h1><p>{description}</p><p>This little corner is coming soon.</p><Link className="button" href="/">Back to the village</Link></>;
}
