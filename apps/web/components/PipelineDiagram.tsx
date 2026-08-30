

interface NodeProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle?: string;
  tone: "neutral" | "process" | "live" | "alert";
}

const TONES: Record<
  NodeProps["tone"],
  { fill: string; stroke: string; title: string; subtitle: string }
> = {
  neutral: {
    fill: "fill-white/[0.04]",
    stroke: "stroke-white/15",
    title: "fill-white/80",
    subtitle: "fill-white/45",
  },
  process: {
    fill: "fill-[#5227FF]/[0.12]",
    stroke: "stroke-[#8b7dfb]/40",
    title: "fill-[#c3baff]",
    subtitle: "fill-[#8b7dfb]",
  },
  live: {
    fill: "fill-emerald-400/10",
    stroke: "stroke-emerald-400/40",
    title: "fill-emerald-300",
    subtitle: "fill-emerald-400/70",
  },
  alert: {
    fill: "fill-rose-400/10",
    stroke: "stroke-rose-400/40",
    title: "fill-rose-300",
    subtitle: "fill-rose-400/70",
  },
};

function Node({ x, y, w, h, title, subtitle, tone }: NodeProps) {
  const t = TONES[tone];
  const midY = subtitle ? y + h / 2 - 9 : y + h / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        strokeWidth={1}
        className={`${t.fill} ${t.stroke}`}
      />
      <text
        x={x + w / 2}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
        className={t.title}
      >
        {title}
      </text>
      {subtitle && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          className={t.subtitle}
        >
          {subtitle}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className="stroke-white/20"
      strokeWidth={1.5}
      markerEnd="url(#pravaah-arrow)"
    />
  );
}

export default function PipelineDiagram() {
  return (
    <svg
      width="100%"
      viewBox="0 0 680 880"
      role="img"
      aria-label="PRAVAAH risk inference pipeline: three trigger types converge into a risk-inference job, flow through feature building, ML prediction, and caching, then branch into a live map update and an alert dispatch to WhatsApp, SMS, and SACHET."
    >
      <defs>
        <marker
          id="pravaah-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            className="stroke-white/30"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      <Arrow x1={140} y1={96} x2={140} y2={136} />
      <Arrow x1={340} y1={96} x2={340} y2={136} />
      <Arrow x1={540} y1={96} x2={540} y2={136} />
      <Node x={50} y={40} w={180} h={56} tone="neutral" title="Scheduled poll" subtitle="15 min baseline" />
      <Node x={250} y={40} w={180} h={56} tone="neutral" title="Sensor threshold" subtitle="ESP32 crosses limit" />
      <Node x={450} y={40} w={180} h={56} tone="neutral" title="Manual + adaptive" subtitle="Simulate, escalation" />

      <Arrow x1={340} y1={192} x2={340} y2={232} />
      <Node
        x={60}
        y={136}
        w={560}
        h={56}
        tone="neutral"
        title="All triggers converge"
        subtitle="risk-inference job queued per village"
      />

      <Arrow x1={340} y1={288} x2={340} y2={328} />
      <Node x={200} y={232} w={280} h={56} tone="process" title="Feature builder" subtitle="Merges dynamic + static data" />

      <Arrow x1={340} y1={384} x2={340} y2={424} />
      <Node x={200} y={328} w={280} h={56} tone="process" title="ML service (FastAPI)" subtitle="POST /predict, /explain" />

      <path d="M340 480V500" fill="none" className="stroke-white/20" strokeWidth={1} />
      <Arrow x1={340} y1={500} x2={265} y2={520} />
      <Arrow x1={340} y1={500} x2={415} y2={520} />
      <Node x={200} y={424} w={280} h={56} tone="process" title="Inference worker" subtitle="Writes risk snapshot" />

      <Node x={200} y={520} w={130} h={56} tone="process" title="Redis" subtitle="Cache + relay" />
      <Node x={350} y={520} w={130} h={56} tone="process" title="Socket.IO" subtitle="Pushes updates" />

      <Arrow x1={265} y1={576} x2={265} y2={616} />
      <Arrow x1={415} y1={576} x2={415} y2={616} />
      <Node x={150} y={616} w={380} h={56} tone="process" title="Express API gateway" subtitle="REST + WebSocket relay" />

      <Arrow x1={340} y1={672} x2={190} y2={712} />
      <Arrow x1={340} y1={672} x2={490} y2={712} />
      <Node x={50} y={712} w={280} h={56} tone="live" title="Live map update" subtitle="Village color changes" />
      <Node x={350} y={712} w={280} h={56} tone="alert" title="Alert dispatch" subtitle="Fires only on class change" />

      <Arrow x1={490} y1={768} x2={393} y2={808} />
      <Arrow x1={490} y1={768} x2={490} y2={808} />
      <Arrow x1={490} y1={768} x2={587} y2={808} />
      <Node x={350} y={808} w={86} h={44} tone="alert" title="WhatsApp" />
      <Node x={447} y={808} w={86} h={44} tone="alert" title="SMS" />
      <Node x={544} y={808} w={86} h={44} tone="alert" title="SACHET" />
    </svg>
  );
}