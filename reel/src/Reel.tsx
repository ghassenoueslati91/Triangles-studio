import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";
import { SERIF, SANS } from "./fonts";

const IVORY = "#F4EFE6";
const GOLD = "#C9A96E";
const INK = "#0B0B0C";

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // expo-out: premium settle
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useIsWide = () => {
  const { width, height } = useVideoConfig();
  return width > height;
};

/* ---------- Primitives ---------- */

/** Ken Burns photo: slow scale + drift. objectPosition keeps faces/garments safe. */
const Photo: React.FC<{
  src: string;
  from?: number;
  to?: number;
  pos?: string;
  driftX?: number;
  driftY?: number;
  dur: number;
  style?: React.CSSProperties;
}> = ({ src, from = 1.12, to = 1.0, pos = "50% 50%", driftX = 0, driftY = 0, dur, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          scale: String(from + (to - from) * t),
          translate: `${driftX * t}px ${driftY * t}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Masked line reveal: text slides up from behind a clip edge. */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, dur = 22, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + dur], [0, 1], { ...clamp, easing: EASE_OUT });
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", ...style }}>
      <div style={{ translate: `0 ${(1 - p) * 110}%`, opacity: interpolate(p, [0, 0.4], [0, 1], clamp) }}>
        {children}
      </div>
    </div>
  );
};

const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({
  children,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 20], [0, 1], { ...clamp, easing: EASE_OUT });
  return <div style={{ opacity: p, translate: `0 ${(1 - p) * 24}px`, ...style }}>{children}</div>;
};

/** Hairline that draws itself left→right. */
const Rule: React.FC<{ delay?: number; width: number; color?: string }> = ({ delay = 0, width, color = GOLD }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 26], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  return <div style={{ width: width * p, height: 1.5, background: color, margin: "0 auto" }} />;
};

const Eyebrow: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 22,
  color = IVORY,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 500,
      fontSize: size,
      letterSpacing: "0.42em",
      textTransform: "uppercase",
      color,
      paddingLeft: "0.42em",
    }}
  >
    {children}
  </div>
);

/** Fade from/to black at scene edges. */
const Fade: React.FC<{ dur: number; inF?: number; outF?: number }> = ({ dur, inF = 8, outF = 8 }) => {
  const frame = useCurrentFrame();
  const o = Math.max(
    inF ? interpolate(frame, [0, inF], [1, 0], clamp) : 0,
    outF ? interpolate(frame, [dur - outF, dur], [0, 1], clamp) : 0,
  );
  return <AbsoluteFill style={{ background: INK, opacity: o, pointerEvents: "none" }} />;
};

/** Bottom gradient for legibility. */
const Scrim: React.FC<{ strength?: number; from?: "bottom" | "top" | "both" }> = ({ strength = 0.75, from = "bottom" }) => {
  const bg =
    from === "both"
      ? `linear-gradient(180deg, rgba(0,0,0,${strength * 0.7}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`
      : from === "top"
        ? `linear-gradient(180deg, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,0) 45%)`
        : `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`;
  return <AbsoluteFill style={{ background: bg }} />;
};

/** Brand mark: two interlocking triangles inside a circle, stroke-drawn. */
const Mark: React.FC<{ size: number; delay?: number; color?: string }> = ({ size, delay = 0, color = IVORY }) => {
  const frame = useCurrentFrame();
  const draw = (d: number, len: number) =>
    interpolate(frame, [delay + d, delay + d + 34], [len, 0], { ...clamp, easing: EASE_IN_OUT });
  const tri1 = "M 40 128 L 82 44 L 124 128 Z";
  const tri2 = "M 70 146 L 115 62 L 160 146 Z";
  const circle = 2 * Math.PI * 92;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <circle
        cx="100"
        cy="100"
        r="92"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={circle}
        strokeDashoffset={draw(0, circle)}
        transform="rotate(-90 100 100)"
      />
      <path d={tri1} stroke={color} strokeWidth="5" strokeLinejoin="miter" strokeDasharray={260} strokeDashoffset={draw(10, 260)} />
      <path d={tri2} stroke={color} strokeWidth="5" strokeLinejoin="miter" strokeDasharray={280} strokeDashoffset={draw(18, 280)} />
    </svg>
  );
};

/** Animated film grain + vignette, sits on top of everything. */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Quick white exposure flash used as a cut accent. */
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 2, at, at + 5], [0, 0.55, 0], clamp);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/* ---------- Scenes ---------- */

// S1 — Hook: silver gown against blue sky, "Explore. Create. Inspire."
const SceneHook: React.FC<{ dur: number }> = ({ dur }) => {
  const wide = useIsWide();
  const size = wide ? 120 : 132;
  const words = ["Explore.", "Create.", "Inspire."];
  return (
    <AbsoluteFill>
      <Photo src="02.webp" dur={dur} from={wide ? 1.12 : 1.22} to={wide ? 1.0 : 1.04} pos={wide ? "50% 6%" : "50% 40%"} driftY={wide ? 0 : -30} />
      <Scrim strength={0.8} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: wide ? "flex-start" : "center",
          padding: wide ? "0 0 120px 140px" : "0 0 300px 0",
        }}
      >
        <div style={{ textAlign: wide ? "left" : "center" }}>
          {words.map((w, i) => (
            <Reveal key={w} delay={8 + i * 12} dur={24}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: i === 1 ? "italic" : "normal",
                  fontWeight: 300,
                  fontSize: size,
                  lineHeight: 0.98,
                  color: i === 1 ? GOLD : IVORY,
                  letterSpacing: "-0.01em",
                }}
              >
                {w}
              </div>
            </Reveal>
          ))}
        </div>
      </AbsoluteFill>
      <Fade dur={dur} inF={10} outF={0} />
    </AbsoluteFill>
  );
};

// S2 — Montage: rhythmic cuts across disciplines with index captions.
const MONTAGE = [
  { src: "05.webp", label: "Couture", pos: "50% 30%" },
  { src: "08.webp", label: "Campaign", pos: "50% 35%" },
  { src: "12.webp", label: "Beauty", pos: "50% 30%" },
  { src: "03.webp", label: "Editorial", pos: "50% 35%" },
];
const SceneMontage: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wide = useIsWide();
  const step = dur / MONTAGE.length;
  const idx = Math.min(MONTAGE.length - 1, Math.floor(frame / step));
  return (
    <AbsoluteFill style={{ background: INK }}>
      {MONTAGE.map((m, i) => (
        <Sequence key={m.src} from={Math.round(i * step)} durationInFrames={Math.round(step)}>
          {wide ? (
            // In 16:9, show portrait frames uncropped as a centred plate over a blurred echo.
            <AbsoluteFill>
              <Photo src={m.src} dur={step} from={1.3} to={1.2} pos={m.pos} style={{ filter: "blur(40px) brightness(0.45)" }} />
              <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 640, height: 960, position: "relative", boxShadow: "0 40px 120px rgba(0,0,0,.6)" }}>
                  <Photo src={m.src} dur={step} from={1.1} to={1.0} pos={m.pos} />
                </div>
              </AbsoluteFill>
            </AbsoluteFill>
          ) : (
            <Photo src={m.src} dur={step} from={1.14} to={1.0} pos={m.pos} />
          )}
        </Sequence>
      ))}
      <Scrim strength={0.55} from="both" />
      {MONTAGE.map((_, i) => (i > 0 ? <Flash key={i} at={Math.round(i * step)} /> : null))}
      <AbsoluteFill
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          padding: wide ? "0 120px" : "0 72px",
          top: "auto",
          bottom: wide ? 50 : 300,
          height: 140,
        }}
      >
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: wide ? 64 : 76, color: IVORY, fontWeight: 300 }}>
          {MONTAGE[idx].label}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: "0.3em", color: GOLD, fontWeight: 500 }}>
          {String(idx + 1).padStart(2, "0")} / {String(MONTAGE.length).padStart(2, "0")}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S3 — Identity: mark draws, name reveals.
const SceneIdentity: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wide = useIsWide();
  const nameSize = wide ? 150 : 150;
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(201,169,110,${interpolate(frame, [0, dur], [0.05, 0.16], clamp)}) 0%, rgba(0,0,0,0) 55%)`,
        }}
      />
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Mark size={wide ? 150 : 190} delay={2} />
        <div style={{ marginTop: 10 }}>
          <Reveal delay={22}>
            <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: nameSize, lineHeight: 0.95, color: IVORY, letterSpacing: "0.02em" }}>
              Ghassen
            </div>
          </Reveal>
          <Reveal delay={30}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 300, fontSize: nameSize, lineHeight: 0.95, color: GOLD }}>
              Oueslati
            </div>
          </Reveal>
        </div>
        <Rule delay={42} width={wide ? 520 : 420} />
        <FadeUp delay={50}>
          <Eyebrow size={wide ? 22 : 24}>Photography · Film</Eyebrow>
          <div style={{ height: 16 }} />
          <Eyebrow size={wide ? 22 : 24}>Creative Direction · Doha</Eyebrow>
        </FadeUp>
      </div>
      <Fade dur={dur} inF={0} outF={8} />
    </AbsoluteFill>
  );
};

// S4 — Range: hospitality + fashion split panels sliding in.
const SceneRange: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wide = useIsWide();
  const slide = interpolate(frame, [0, 24], [1, 0], { ...clamp, easing: EASE_OUT });
  const slide2 = interpolate(frame, [6, 30], [1, 0], { ...clamp, easing: EASE_OUT });
  const panel = (src: string, pos: string, s: number, dir: 1 | -1): React.CSSProperties => ({
    position: "absolute",
    overflow: "hidden",
    ...(wide
      ? { top: 0, bottom: 0, width: "50%", left: dir === -1 ? 0 : "50%", translate: `0 ${dir * s * 100}%` }
      : { left: 0, right: 0, height: "50%", top: dir === -1 ? 0 : "50%", translate: `${dir * s * 100}% 0` }),
  });
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={panel("11.webp", "", slide, -1)}>
        <Photo src="11.webp" dur={dur} from={1.15} to={1.02} pos={wide ? "50% 40%" : "50% 30%"} />
      </div>
      <div style={panel("04.webp", "", slide2, 1)}>
        <Photo src="04.webp" dur={dur} from={1.15} to={1.02} pos={wide ? "50% 20%" : "50% 4%"} />
      </div>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.28)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: wide ? 90 : 340 }}>
        <div
          style={{
            background: "rgba(11,11,12,0.72)",
            backdropFilter: "blur(6px)",
            padding: wide ? "40px 70px" : "44px 56px",
            textAlign: "center",
            border: `1px solid rgba(201,169,110,0.5)`,
            opacity: interpolate(frame, [18, 34], [0, 1], clamp),
            scale: String(interpolate(frame, [18, 40], [0.94, 1], { ...clamp, easing: EASE_OUT })),
          }}
        >
          <Eyebrow size={20} color={GOLD}>One eye, every discipline</Eyebrow>
          <div style={{ height: 22 }} />
          <Reveal delay={26}>
            <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: wide ? 66 : 64, color: IVORY, lineHeight: 1.05 }}>
              Fashion · Beauty
            </div>
          </Reveal>
          <Reveal delay={32}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 300, fontSize: wide ? 66 : 64, color: IVORY, lineHeight: 1.05 }}>
              Hospitality · Film
            </div>
          </Reveal>
        </div>
      </AbsoluteFill>
      <Fade dur={dur} inF={0} outF={6} />
    </AbsoluteFill>
  );
};

// S5 — Proof: beauty close-up with counting stats.
const Counter: React.FC<{ to: number; suffix: string; label: string; delay: number; wide: boolean }> = ({
  to,
  suffix,
  label,
  delay,
  wide,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 34], [0, 1], { ...clamp, easing: EASE_OUT });
  return (
    <FadeUp delay={delay} style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: wide ? 120 : 112, color: IVORY, lineHeight: 1, fontVariantNumeric: "lining-nums tabular-nums" }}>
        {Math.round(to * p)}
        <span style={{ color: GOLD }}>{suffix}</span>
      </div>
      <div style={{ marginTop: 14 }}>
        <Eyebrow size={18}>{label}</Eyebrow>
      </div>
    </FadeUp>
  );
};
const SceneProof: React.FC<{ dur: number }> = ({ dur }) => {
  const wide = useIsWide();
  return (
    <AbsoluteFill>
      <Photo src="15.webp" dur={dur} from={1.08} to={1.2} pos={wide ? "50% 18%" : "50% 25%"} />
      <Scrim strength={0.9} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: wide ? "0 160px 110px" : "0 50px 360px" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: wide ? 40 : 10 }}>
          <Counter to={12} suffix="+" label="Years" delay={6} wide={wide} />
          <Counter to={300} suffix="+" label="Projects" delay={14} wide={wide} />
          <Counter to={50} suffix="+" label="Brands" delay={22} wide={wide} />
        </div>
      </AbsoluteFill>
      <Fade dur={dur} inF={6} outF={6} />
    </AbsoluteFill>
  );
};

// S6 — Trust: client roster on black, staggered.
const CLIENTS = [
  "Vogue Arabia",
  "The New York Times",
  "Swarovski",
  "Waldorf Astoria",
  "Ralph Lauren Home",
  "L'Oréal",
  "Roberto Cavalli",
  "Vogue Italia",
];
const SceneTrust: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wide = useIsWide();
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", translate: `0 ${interpolate(frame, [0, dur], [20, -20])}px` }}>
        <FadeUp>
          <Eyebrow size={22} color={GOLD}>Trusted by</Eyebrow>
        </FadeUp>
        <div style={{ height: wide ? 40 : 56 }} />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: wide ? 1500 : 940,
            columnGap: wide ? 56 : 0,
            rowGap: wide ? 18 : 6,
            flexDirection: wide ? "row" : "column",
          }}
        >
          {CLIENTS.map((c, i) => (
            <Reveal key={c} delay={8 + i * 5} dur={20}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: i % 2 ? "italic" : "normal",
                  fontWeight: 300,
                  fontSize: wide ? 64 : 76,
                  color: IVORY,
                  lineHeight: 1.12,
                  opacity: 0.55 + 0.45 * random(`c${i}`),
                }}
              >
                {c}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Fade dur={dur} inF={6} outF={8} />
    </AbsoluteFill>
  );
};

// S7 — The director: on set, end-to-end promise.
const SceneDirector: React.FC<{ dur: number }> = ({ dur }) => {
  const wide = useIsWide();
  return (
    <AbsoluteFill>
      <Photo src="14.jpg" dur={dur} from={1.18} to={1.04} pos={wide ? "55% 40%" : "57% 50%"} driftX={wide ? 0 : -20} />
      <Scrim strength={0.85} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: wide ? "flex-start" : "center",
          padding: wide ? "0 0 110px 130px" : "0 60px 340px",
          textAlign: wide ? "left" : "center",
        }}
      >
        <FadeUp delay={4}>
          <Eyebrow size={20} color={GOLD}>Concept · Shoot · Edit · Deliver</Eyebrow>
        </FadeUp>
        <div style={{ height: 24 }} />
        <Reveal delay={10}>
          <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: wide ? 86 : 84, color: IVORY, lineHeight: 1.02 }}>
            From the first idea
          </div>
        </Reveal>
        <Reveal delay={18}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 300, fontSize: wide ? 86 : 84, color: IVORY, lineHeight: 1.02 }}>
            to the final frame.
          </div>
        </Reveal>
      </AbsoluteFill>
      <Fade dur={dur} inF={8} outF={0} />
    </AbsoluteFill>
  );
};

// S8 — CTA: blurred campaign plate, mark, URL.
const SceneCTA: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wide = useIsWide();
  const blur = interpolate(frame, [0, 30], [0, 14], { ...clamp, easing: EASE_IN_OUT });
  const dim = interpolate(frame, [0, 30], [1, 0.38], { ...clamp, easing: EASE_IN_OUT });
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Photo
        src="01.webp"
        dur={dur}
        from={1.12}
        to={1.0}
        pos={wide ? "50% 40%" : "47% 50%"}
        style={{ filter: `blur(${blur}px) brightness(${dim})` }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Mark size={wide ? 110 : 140} delay={18} />
          <div style={{ height: wide ? 36 : 56 }} />
          <Reveal delay={30}>
            <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: wide ? 104 : 108, color: IVORY, lineHeight: 1 }}>
              Start your
            </div>
          </Reveal>
          <Reveal delay={36}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 300, fontSize: wide ? 104 : 108, color: GOLD, lineHeight: 1 }}>
              next story.
            </div>
          </Reveal>
          <div style={{ height: wide ? 40 : 60 }} />
          <FadeUp delay={48}>
            <div
              style={{
                border: `1.5px solid ${IVORY}`,
                padding: wide ? "22px 48px" : "26px 52px",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: wide ? 30 : 34,
                letterSpacing: "0.12em",
                color: IVORY,
              }}
            >
              ghassen-oueslati.com
            </div>
          </FadeUp>
          <div style={{ height: 34 }} />
          <FadeUp delay={58}>
            <Eyebrow size={20} color="rgba(244,239,230,0.75)">Lusail · Doha · GCC · Europe</Eyebrow>
            <div style={{ height: 14 }} />
            <Eyebrow size={20} color="rgba(244,239,230,0.75)">Proposal within 24 hours</Eyebrow>
          </FadeUp>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Timeline ---------- */

// 30fps. Scene lengths sit on a ~15-frame grid (≈ 120 BPM) so any 118–124 BPM track cuts on beat.
export const TIMELINE = [
  { C: SceneHook, d: 90 },
  { C: SceneMontage, d: 120 },
  { C: SceneIdentity, d: 105 },
  { C: SceneRange, d: 105 },
  { C: SceneProof, d: 90 },
  { C: SceneTrust, d: 90 },
  { C: SceneDirector, d: 90 },
  { C: SceneCTA, d: 135 },
];
export const TOTAL = TIMELINE.reduce((a, s) => a + s.d, 0);

export const Reel: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {TIMELINE.map(({ C, d }, i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d} premountFor={30}>
            <C dur={d} />
          </Sequence>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};
