import { useState } from "react";
import { Sparkles } from "lucide-react";

const DEFAULT_COLORS = ["#FF1D7E", "#15CFA0", "#7B2FF7", "#FFB347", "#A472FF"];

export default function ConceptDiagram({ diagram }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (!diagram?.nodes?.length) return null;

  const nodes = diagram.nodes.map((n, i) => ({
    ...n,
    color: n.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    x: Math.min(92, Math.max(8, n.x ?? 50)),
    y: Math.min(88, Math.max(12, n.y ?? 50)),
  }));

  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const activeNode = hoveredId ? nodeById[hoveredId] : null;

  return (
    <div className="w-full flex flex-col items-center">
      {diagram.title && (
        <h4 className="font-display font-semibold text-sm text-text-primary mb-2 w-full text-left">
          {diagram.title}
        </h4>
      )}
      <div className="w-full h-[200px] bg-dark-card border border-white/5 rounded-2xl relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
          {(diagram.edges || []).map((edge, i) => {
            const from = nodeById[edge.from];
            const to = nodeById[edge.to];
            if (!from || !to) return null;
            const x1 = (from.x / 100) * 200;
            const y1 = (from.y / 100) * 100;
            const x2 = (to.x / 100) * 200;
            const y2 = (to.y / 100) * 100;
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edge.color || "rgba(255,255,255,0.25)"}
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 3}
                    textAnchor="middle"
                    fill="#766F85"
                    fontSize="5"
                    fontFamily="monospace"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="rgba(255,255,255,0.35)" />
            </marker>
          </defs>
          {nodes.map((node) => {
            const cx = (node.x / 100) * 200;
            const cy = (node.y / 100) * 100;
            const active = hoveredId === node.id;
            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? 11 : 9}
                  fill={`${node.color}22`}
                  stroke={node.color}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="5.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.label?.slice(0, 12)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="w-full mt-4 min-h-[50px] p-3 bg-white/[0.02] border border-white/5 rounded-xl text-left">
        {activeNode?.detail ? (
          <p className="text-[12px] text-text-dim leading-relaxed">
            <strong className="text-text-primary">{activeNode.label}:</strong> {activeNode.detail}
          </p>
        ) : (
          <p className="text-[12px] text-text-faint font-mono flex items-center gap-1.5 justify-center py-1">
            <Sparkles size={12} className="text-accent-pink" />
            {diagram.description || "Hover over diagram nodes to explore relationships."}
          </p>
        )}
      </div>
    </div>
  );
}
