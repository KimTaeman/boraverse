import Link from "next/link";
import { art } from "@/content/art";

const rooms = [
  { href: "/ocean", icon: "✦", name: "Purple Ocean", text: "A little light, together", style: "ocean" },
  { href: "/arcade", icon: "✿", name: "Bangtan Arcade", text: "Play and discover", style: "arcade" },
  { href: "/magic-shop", icon: "✉", name: "Magic Shop", text: "A little comfort awaits", style: "magic" },
  { href: "/garden", icon: "❀", name: "Memory Garden", text: "A place to grow", style: "garden" },
] as const;

export default function Home() {
  return <>
    <section className="village-hero">
      <div className="hero-art" aria-hidden="true" style={{ backgroundImage: `url("${art["home.sky"].src}")` }} />
      <div className="hero-content">
        <p className="eyebrow">A LITTLE WORLD FOR ARMY <span aria-hidden="true">✦</span></p>
        <h1>A little magic<br />found you.</h1>
        <p>A tiny universe of happy discoveries, made with love for ARMY in Bangkok and beyond.</p>
        <Link className="button hero-button" href="/ocean">Light up our ocean <span aria-hidden="true">↗</span></Link>
        <p className="hero-note">Come as you are. Stay as long as you like.</p>
      </div>
      <span className="hero-star star-one" aria-hidden="true">✦</span><span className="hero-star star-two" aria-hidden="true">✧</span>
      <div className="hero-hills" aria-hidden="true"><span className="little-house"><i /></span><span className="hill-door"><i /></span><span className="little-house house-right"><i /></span></div>
      <div className="hero-bottom" aria-hidden="true">✳ &nbsp; ✧ &nbsp; ✳</div>
    </section>
    <section className="village-section" aria-labelledby="explore-title">
      <div className="section-heading"><div><p className="eyebrow">YOUR LITTLE WORLD AWAITS</p><h2 id="explore-title">Where shall we wander?</h2></div><p>Every little corner has something waiting for you.</p></div>
      <div className="room-grid">{rooms.map((room, index) => <Link className={`room-card room-${room.style}`} href={room.href} key={room.href}>
        <span className="room-number">0{index + 1} / EXPLORE</span>
        <span className="room-art" aria-hidden="true"><span className="room-symbol">{room.icon}</span><span className="room-orbit">✧</span></span>
        <span className="room-name">{room.name}<span aria-hidden="true">↗</span></span><span className="room-description">{room.text}</span>
      </Link>)}</div>
    </section>
    <section className="ocean-invitation" aria-labelledby="invitation-title">
      <div><p className="eyebrow">A LITTLE LIGHT FROM EACH OF US</p><h2 id="invitation-title">A sea of little lights.</h2><p>Different stories, one beautiful purple memory. Come see what we’re dreaming of together.</p><Link className="button" href="/ocean">Visit the Purple Ocean <span aria-hidden="true">↗</span></Link></div>
      <div className="invitation-art" aria-hidden="true">✦ <span>✧</span> ✦</div>
    </section>
    <div className="discovery"><span aria-hidden="true">✧</span><p>A little magic for another day <strong>Find a little fortune</strong></p><Link href="/magic-shop">Visit the Magic Shop <span aria-hidden="true">↗</span></Link></div>
  </>;
}
