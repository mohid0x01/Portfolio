import { useMemo } from "react";
import { motion } from "framer-motion";
import { countryCodeToFlag } from "@/lib/flagEmoji";

interface CountryData {
  name: string;
  code: string;
  value: number;
}

interface WorldMapProps {
  data: CountryData[];
  selectedCountry?: string | null;
  onCountryClick?: (code: string | null) => void;
}

// Approximate [cx, cy] positions on a 1000x500 equirectangular map
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [215, 180], GB: [470, 130], DE: [500, 140], FR: [480, 155],
  CA: [195, 130], AU: [820, 360], JP: [855, 175], CN: [790, 185],
  IN: [720, 220], BR: [295, 305], RU: [680, 120], KR: [840, 185],
  MX: [195, 225], IT: [510, 165], ES: [462, 170], PL: [515, 140],
  NL: [485, 135], TR: [555, 175], SA: [595, 215], AR: [270, 370],
  ZA: [535, 360], NG: [495, 270], EG: [552, 200], ID: [800, 285],
  PK: [680, 210], UA: [555, 140], SE: [510, 110], NO: [500, 95],
  DK: [495, 115], FI: [530, 100], PT: [452, 170], GR: [530, 175],
  CZ: [510, 140], RO: [540, 155], HU: [520, 148], PH: [840, 250],
  VN: [810, 255], TH: [795, 255], MY: [800, 270], SG: [805, 285],
  BD: [740, 225], NZ: [905, 415], CL: [260, 355], CO: [255, 270],
  PE: [250, 310], VE: [265, 255], IL: [565, 190], AE: [620, 220],
};

const CONTINENT_PATHS = [
  "M 130 90 L 240 85 L 270 130 L 285 170 L 240 220 L 200 230 L 160 210 L 130 180 L 120 140 Z",
  "M 230 250 L 300 240 L 320 280 L 310 350 L 285 400 L 255 410 L 225 370 L 215 310 L 225 270 Z",
  "M 445 90 L 560 85 L 565 100 L 545 120 L 560 145 L 540 165 L 510 170 L 475 155 L 450 135 L 445 115 Z",
  "M 465 185 L 575 180 L 590 210 L 585 290 L 565 370 L 520 395 L 490 385 L 460 330 L 450 260 L 455 215 Z",
  "M 570 85 L 880 80 L 900 140 L 880 200 L 850 230 L 780 270 L 720 265 L 650 240 L 600 200 L 560 170 L 555 130 Z",
  "M 780 335 L 890 325 L 910 375 L 895 415 L 840 430 L 790 410 L 760 375 L 765 345 Z",
  "M 320 50 L 390 45 L 400 80 L 380 100 L 340 105 L 315 80 Z",
];

const COLORS = [
  "hsl(261 87% 60%)", "hsl(162 72% 46%)", "hsl(200 80% 55%)",
  "hsl(35 90% 55%)", "hsl(340 75% 55%)", "hsl(280 70% 55%)",
];

export function WorldMap({ data, selectedCountry, onCountryClick }: WorldMapProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  const bubbles = useMemo(() => {
    return data
      .filter((d) => COUNTRY_COORDS[d.code])
      .map((d) => {
        const [cx, cy] = COUNTRY_COORDS[d.code];
        const ratio = d.value / maxValue;
        const r = 6 + ratio * 28;
        return { ...d, cx, cy, r, ratio, flag: countryCodeToFlag(d.code) };
      })
      .sort((a, b) => a.r - b.r);
  }, [data, maxValue]);

  const handleClick = (code: string) => {
    if (!onCountryClick) return;
    onCountryClick(selectedCountry === code ? null : code);
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: "50%" }}>
      <svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: "visible" }}
      >
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`h${i}`} x1="0" y1={i * 125} x2="1000" y2={i * 125}
            stroke="hsl(var(--border))" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={`v${i}`} x1={i * 143} y1="0" x2={i * 143} y2="500"
            stroke="hsl(var(--border))" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}

        {/* Continents */}
        {CONTINENT_PATHS.map((d, i) => (
          <path key={i} d={d}
            fill="hsl(var(--muted))" fillOpacity="0.35"
            stroke="hsl(var(--border))" strokeWidth="0.8" strokeOpacity="0.4" />
        ))}

        {/* Country bubbles */}
        {bubbles.map((b, i) => {
          const isSelected = selectedCountry === b.code;
          const isDimmed = selectedCountry != null && !isSelected;
          const color = COLORS[i % COLORS.length];

          return (
            <g
              key={b.code}
              className="group"
              onClick={() => handleClick(b.code)}
              style={{ cursor: onCountryClick ? "pointer" : "default" }}
            >
              {/* Pulse ring */}
              <motion.circle
                cx={b.cx} cy={b.cy} r={b.r + 6}
                fill="none" stroke={color}
                strokeWidth={isSelected ? 2 : 1}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, isSelected ? 1.25 : 1.15, 1],
                  opacity: isSelected ? [0.5, 0.15, 0.5] : [0.25, 0.05, 0.25],
                }}
                transition={{ duration: isSelected ? 1.5 : 2.5, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Selection ring */}
              {isSelected && (
                <motion.circle
                  cx={b.cx} cy={b.cy} r={b.r + 12}
                  fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7, rotate: 360 }}
                  transition={{ duration: 0.3, rotate: { duration: 8, repeat: Infinity, ease: "linear" } }}
                />
              )}

              {/* Main bubble */}
              <motion.circle
                cx={b.cx} cy={b.cy} r={b.r}
                fill={`${color.replace(")", " / " + (isDimmed ? 0.08 : (0.25 + b.ratio * 0.5)) + ")")}`}
                stroke={color}
                strokeWidth={isSelected ? 2 + b.ratio : 1 + b.ratio}
                strokeOpacity={isDimmed ? 0.2 : (0.5 + b.ratio * 0.4)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isDimmed ? 0.35 : 1 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "backOut" }}
                whileHover={onCountryClick ? { scale: 1.15 } : {}}
              />

              {/* Country code label */}
              <motion.text
                x={b.cx} y={b.cy + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill="hsl(var(--primary-foreground))"
                fontSize={b.r > 14 ? 9 : 7} fontWeight="700" fontFamily="monospace"
                initial={{ opacity: 0 }} animate={{ opacity: isDimmed ? 0.3 : 1 }}
                transition={{ delay: i * 0.08 + 0.3 }}
                style={{ pointerEvents: "none" }}
              >
                {b.code}
              </motion.text>

              {/* Tooltip */}
              <title>{b.flag} {b.name}: {b.value} visit{b.value !== 1 ? "s" : ""}{onCountryClick ? (isSelected ? " — click to deselect" : " — click to filter") : ""}</title>

              {/* Flag emoji for larger bubbles */}
              {b.r > 20 && (
                <motion.text
                  x={b.cx} y={b.cy - b.r - 6}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="14"
                  initial={{ opacity: 0 }} animate={{ opacity: isDimmed ? 0.2 : 1 }}
                  transition={{ delay: i * 0.08 + 0.4 }}
                  style={{ pointerEvents: "none" }}
                >
                  {b.flag}
                </motion.text>
              )}

              {/* Visit count for large bubbles */}
              {b.r > 18 && (
                <motion.text
                  x={b.cx} y={b.cy + 11}
                  textAnchor="middle"
                  fill="hsl(var(--secondary))"
                  fontSize="7" fontWeight="800" fontFamily="monospace"
                  initial={{ opacity: 0 }} animate={{ opacity: isDimmed ? 0.2 : 1 }}
                  transition={{ delay: i * 0.08 + 0.4 }}
                  style={{ pointerEvents: "none" }}
                >
                  {b.value}
                </motion.text>
              )}
            </g>
          );
        })}
      </svg>

      {/* "Click to clear filter" hint */}
      {selectedCountry && onCountryClick && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onCountryClick(null)}
          className="absolute bottom-2 right-2 flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs font-bold border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
        >
          <span>🗺 Showing: {data.find((d) => d.code === selectedCountry)?.name ?? selectedCountry}</span>
          <span className="text-muted-foreground">✕ Clear</span>
        </motion.button>
      )}
    </div>
  );
}
