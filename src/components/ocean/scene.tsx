import type { CSSProperties } from "react";

export const whaleOutline = "M310 330 C338 270 428 260 510 290 C561 310 605 345 655 330 C667 305 694 290 723 294 C713 314 701 332 680 344 C710 349 726 365 732 382 C697 385 670 372 651 354 C599 393 536 409 470 397 C459 434 438 452 416 451 C420 423 418 405 406 387 C352 378 317 357 310 330 Z";
const stars = Array.from({ length: 120 }, (_, i) => ({ x: 195 + (i * 137) % 610, y: 90 + (i * 73) % 390, r: i % 9 === 0 ? 2.6 : 1.1 }));

export default function OceanScene({ count, accepted, pending }: { count: number | null; accepted: boolean; pending: boolean }) {
  const density = count === null ? 0 : Math.min(120, count);
  const glow = density / 120;
  return <div className="ocean-scene ocean-preview" data-state={accepted ? "accepted" : pending ? "pending" : "quiet"} style={{ "--ocean-glow": glow } as CSSProperties} aria-hidden="true">
    <svg viewBox="0 0 1000 700" className="ocean-stars" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="whale-body" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f9d7ff" stopOpacity=".7" /><stop offset=".45" stopColor="#b48af5" stopOpacity=".28" /><stop offset="1" stopColor="#7953c6" stopOpacity=".12" /></linearGradient>
        <linearGradient id="ocean-trail"><stop stopColor="#bd91f5" stopOpacity="0" /><stop offset=".65" stopColor="#dca9ff" /><stop offset="1" stopColor="#fff0db" /></linearGradient>
        <radialGradient id="horizon-light"><stop stopColor="#bc86eb" stopOpacity=".5" /><stop offset="1" stopColor="#8c5bd0" stopOpacity="0" /></radialGradient>
      </defs>
      <g data-layer="distant-sky" fill="#ded0ff" opacity=".38">{stars.slice(0, 48).map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r * .45} />)}</g>
      <path data-layer="moon" d="M704 94 A29 29 0 1 0 735 131 A25 25 0 0 1 704 94" fill="#ffe7cf" className="ocean-moon" />
      <g data-layer="collective-lights" opacity={glow}>
        <path d="M280 555 C430 570 350 453 490 401 S720 345 676 218" stroke="#bc8bf1" strokeWidth="80" opacity=".1" fill="none" />
        <path d="M280 555 C430 570 350 453 490 401 S720 345 676 218" stroke="#d7b0ff" strokeWidth="1" strokeDasharray="1 12" fill="none" />
      </g>
      <g data-layer="whale" className="ocean-whale" opacity={density === 0 ? 0 : .35 + glow * .65}>
        <path d={whaleOutline} fill="url(#whale-body)" stroke="#dfbaff" strokeWidth="2" />
        <path d="M316 335 Q370 384 450 377 M335 340 Q380 375 434 370 M348 343 Q385 365 416 363" fill="none" stroke="#d5adf3" strokeWidth="1.2" opacity=".7" />
        <path d="M468 297 Q486 260 514 250 Q516 283 540 305 M502 359 Q534 398 565 395 Q550 366 539 353" fill="url(#whale-body)" stroke="#dfbaff" strokeWidth="1.5" />
        <path d="M410 298 V314 M402 306 H418 M548 337 V349 M542 343 H554 M610 346 V358 M604 352 H616" stroke="#ffe7ff" strokeWidth="1" />
        <circle cx="342" cy="326" r="3" fill="#fff0dc" />
        <path d="M360 310 Q460 275 557 329" fill="none" stroke="#f7dcff" opacity=".45" />
      </g>
      <g data-layer="contribution-stars" fill="#ffe5f9">{stars.slice(0, density).map((star, i) => <circle className="ocean-contribution-light" key={i} cx={star.x} cy={star.y} r={star.r} opacity={.45 + (i % 5) * .12} />)}</g>
      <ellipse data-layer="horizon-glow" cx="500" cy="580" rx="380" ry="170" fill="url(#horizon-light)" />

      <g data-layer="distant-stage"><path d="M447 558 V524 H553 V558 M466 555 V530 H534 V555" fill="none" stroke="#a67ccd" strokeWidth="3" /><path d="M478 552 V533 H522 V552" fill="#c69cf0" opacity=".3" /></g>
      <g data-layer="crowd">{[0, 1, 2, 3, 4, 5, 6].map(i => <g key={i} transform={`translate(${342 + i * 52} ${590 + Math.abs(3 - i) * 6})`}><path d="M-28 80 Q-29 30 -17 24 Q0 14 17 24 Q29 30 28 80" fill={i % 2 ? "#302543" : "#24213a"} stroke="#8c6e9f" strokeWidth="1" /><ellipse cy="3" rx="17" ry="21" fill="#3b2e4b" stroke="#b498b5" strokeWidth="1" /><path d="M-17 2 Q-21 -24 1 -21 Q20 -18 17 5 Q7 -5 -4 -6Z" fill="#1a192f" /></g>)}</g>
      <g data-layer="your-light" className={accepted ? "new-light" : pending ? "pending-light" : "waiting-light"}>
        <path className="your-light-trail" d="M500 627 Q400 493 555 378" fill="none" stroke="url(#ocean-trail)" strokeWidth="2" strokeDasharray="2 6" />
        <circle cx={accepted ? 555 : 500} cy={accepted ? 378 : 627} r="7" fill="#ffe7ff" className="your-light-orb" />
        {accepted && <path d="M555 362 V394 M539 378 H571" stroke="#fff1da" strokeWidth="2" />}
      </g>
    </svg>
    <span className="ocean-scene-caption">{density === 0 ? "A quiet sky, waiting for our little lights." : "A little brighter, because we’re here together."}</span>
  </div>;
}
