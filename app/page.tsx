"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BuilderForm } from "@/components/BuilderForm";
import { NPCPreview } from "@/components/NPCPreview";
import { MarkdownOutput } from "@/components/MarkdownOutput";
import { JsonOutput } from "@/components/JsonOutput";
import { buildNpc, type DataBundle } from "@/engine/buildNpc";
import type { BuildConfig, NpcResult } from "@/types/npc";
import type {
  TierData,
  ChassisData,
  InhabitantData,
  OverlayData,
  SizeData,
} from "@/types/data";
import { cn } from "@/lib/utils";

const DEFAULT_CONFIG: BuildConfig = {
  name: " ",
  tier: 0,
  size: "Medium",
  inhabitantPrimary: "Mortal",
  inhabitantSecondary: undefined,
  chassis: "warrior",
  traitOverlay: "none",
  castingMode: "none",
  castingAttribute: undefined,
  customAttacks: [],
  //   {
  //     id: "rust-blade",
  //     name: "Rust Blade",
  //     attackBonus: 8,
  //     damage: "2d8+7",
  //     damageType: "Slash",
  //     range: "Melee",
  //     notes: "",
  //   },
  //   {
  //     id: "grave-bolt",
  //     name: "Grave Bolt",
  //     attackBonus: 7,
  //     damage: "1d10+4",
  //     damageType: "Void",
  //     range: "Far",
  //     notes: "",
  //   },
  // ],
  customTraits: [],
  //   {
  //     id: "deathless-nature",
  //     name: "Deathless Nature",
  //     description:
  //       "Cannot be Poisoned and does not need to eat, breathe, or sleep.",
  //   },
  //   {
  //     id: "forged-frame",
  //     name: "Forged Frame",
  //     description:
  //       "Gains resistance to forced movement and cannot be knocked prone by creatures of smaller size.",
  //   },
  // ],
  customAdversarialActions: [],
  //   {
  //     id: "shield-turn",
  //     name: "Shield Turn",
  //     cost: 3,
  //     description:
  //       "React to an incoming melee hit to gain +3 Armor against that attack.",
  //   },
  // ],
  spells: [],
  //   { id: "s1", rank: 1, name: "Spell Armor" },
  //   { id: "s2", rank: 2, name: "Barrier" },
  // ],
};

type Tab = "builder" | "markdown" | "json";

async function loadData(): Promise<DataBundle & { sizes: SizeData[] }> {
  const [
    tiers,
    chassis,
    inhabitants,
    overlays,
    horde,
    damageProfiles,
    buildRules,
    sizes,
  ] = await Promise.all([
    fetch("/data/tiers.json").then((r) => r.json()),
    fetch("/data/chassis.json").then((r) => r.json()),
    fetch("/data/inhabitants.json").then((r) => r.json()),
    fetch("/data/overlays.json").then((r) => r.json()),
    fetch("/data/horde.json").then((r) => r.json()),
    fetch("/data/damage_profiles.json").then((r) => r.json()),
    fetch("/data/build_rules.json").then((r) => r.json()),
    fetch("/data/sizes.json").then((r) => r.json()),
  ]);
  return {
    tiers,
    chassis,
    inhabitants,
    overlays,
    horde,
    damageProfiles,
    buildRules,
    sizes,
  };
}

export default function NPCBuilderPage() {
  const [tab, setTab] = useState<Tab>("builder");
  const [config, setConfig] = useState<BuildConfig>(DEFAULT_CONFIG);
  const [npc, setNpc] = useState<NpcResult | null>(null);
  const [data, setData] = useState<(DataBundle & { sizes: SizeData[] }) | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load JSON data once on mount
  useEffect(() => {
    loadData()
      .then(setData)
      .catch((e) => setLoadError(String(e)));
  }, []);

  // Re-run engine on every config change
  useEffect(() => {
    if (!data) return;
    try {
      const result = buildNpc(config, data);
      setNpc(result.npc);
    } catch (e) {
      console.error("[NPC Builder] Engine error:", e);
    }
  }, [config, data]);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const errorCount = useMemo(
    () => (npc?.warnings ?? []).filter((w) => w.severity === "error").length,
    [npc],
  );

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-400 font-mono text-sm">
        Failed to load data files: {loadError}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-mono text-sm">
        Loading data...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-mono overflow-hidden">
      {/* ── Title bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface border-b border-border/30 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
        <span className="ml-2 text-[12px] text-muted-foreground tracking-wide">
          path-of-ambition / npc-builder
        </span>
        <div className="ml-auto flex items-center gap-3">
          {errorCount > 0 && (
            <span className="text-[11px] text-red-400 bg-red-950/40 border border-red-900/40 rounded px-2 py-0.5">
              {errorCount} error{errorCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-[11px] text-muted-foreground hover:text-red-400 border border-border/40 hover:border-red-900/60 rounded px-2.5 py-0.5 transition-all"
          >
            reset
          </button>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────── */}
      <div className="flex bg-surface border-b border-border/30 px-4 gap-0.5 shrink-0">
        {(["builder", "markdown", "json"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-[12px] tracking-wide border-b-2 transition-all",
              tab === t
                ? "text-accent border-accent-bright"
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Builder tab ───────────────────────────────────────── */}
      {tab === "builder" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="w-72 shrink-0 border-r border-border/30 bg-surface overflow-hidden flex flex-col">
            <BuilderForm
              config={config}
              onChange={setConfig}
              tiers={data.tiers as TierData[]}
              chassis={data.chassis as ChassisData[]}
              inhabitants={data.inhabitants as InhabitantData[]}
              overlays={data.overlays as OverlayData[]}
              sizes={data.sizes as SizeData[]}
            />
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Right panel header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border/30 shrink-0">
              <span className="text-[11px] uppercase tracking-widest text-teal">
                Stat Block Preview
              </span>
              <div className="flex gap-2">
                <CopyMarkdownButton npc={npc} />
                <DownloadMdButton npc={npc} />
              </div>
            </div>

            <NPCPreview npc={npc} />
          </div>
        </div>
      )}

      {/* ── Markdown tab ──────────────────────────────────────── */}
      {tab === "markdown" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <MarkdownOutput npc={npc} />
        </div>
      )}

      {/* ── JSON tab ──────────────────────────────────────────── */}
      {tab === "json" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <JsonOutput npc={npc} />
        </div>
      )}
    </div>
  );
}

// ── Small inline export buttons ──────────────────────────────

function CopyMarkdownButton({ npc }: { npc: NpcResult | null }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    if (!npc) return;
    navigator.clipboard.writeText(npc.markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handle}
      disabled={!npc}
      className="text-[11px] font-mono border border-accent/60 bg-accent/10 hover:bg-accent/20 text-accent rounded px-2.5 py-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {copied ? "Copied!" : "Copy Markdown"}
    </button>
  );
}

function DownloadMdButton({ npc }: { npc: NpcResult | null }) {
  function handle() {
    if (!npc) return;
    const blob = new Blob([npc.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${npc.name?.replace(/\s+/g, "_") ?? "npc"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button
      onClick={handle}
      disabled={!npc}
      className="text-[11px] font-mono border border-border/50 bg-surface-2 hover:border-accent hover:text-accent text-muted-foreground rounded px-2.5 py-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Download .md
    </button>
  );
}
