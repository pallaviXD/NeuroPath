import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { useStore } from "../../store/useStore";

export default function Analytics() {
  const students = useStore((state) => state.dashboardStudents);

  // 1. Calculate dynamic modality distribution counts
  const modalityData = useMemo(() => {
    const counts = { visual: 0, narrative: 0, kinesthetic: 0, sign: 0 };
    students.forEach(s => {
      if (s.profile?.primary) {
        counts[s.profile.primary]++;
      }
    });

    return [
      { name: "Visual", value: counts.visual || 1, color: "#FF1D7E" },
      { name: "Narrative", value: counts.narrative || 1, color: "#FFB347" },
      { name: "Kinesthetic", value: counts.kinesthetic || 1, color: "#7B2FF7" },
      { name: "Sign Language", value: counts.sign || 1, color: "#15CFA0" }
    ];
  }, [students]);

  // 2. Interventions Timeline mock history
  const timelineData = [
    { day: "Mon", count: 18 },
    { day: "Tue", count: 24 },
    { day: "Wed", count: 32 },
    { day: "Thu", count: 28 },
    { day: "Fri", count: 42 },
    { day: "Sat", count: 12 },
    { day: "Sun", count: 8 }
  ];

  // 3. Most struggled concept counts
  const conceptsData = [
    { concept: "Vector equations", count: 14, color: "#7B2FF7" },
    { concept: "Calvin cycle flow", count: 11, color: "#FF1D7E" },
    { concept: "Unbalanced forces", count: 9, color: "#FFB347" },
    { concept: "Inertia definitions", count: 6, color: "#15CFA0" },
    { concept: "Chlorophyll inputs", count: 4, color: "#A472FF" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Modality Distribution Donut Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left h-[320px] flex flex-col justify-between">
          <h4 className="font-display font-semibold text-sm text-text-primary mb-2">Class Modality Share</h4>
          
          <div className="w-full h-[220px] flex items-center gap-4">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalityData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {modalityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#08060B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                    itemStyle={{ color: "#F5F2FA", fontSize: "11px", fontFamily: "monospace" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend column */}
            <div className="flex flex-col gap-2 font-mono text-[10.5px] text-text-faint">
              {modalityData.map((m) => (
                <div key={m.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-text-dim font-bold">{m.value}</span> {m.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Interventions Line Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left h-[320px] flex flex-col justify-between">
          <h4 className="font-display font-semibold text-sm text-text-primary mb-2">Interventions Over Time</h4>
          
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <XAxis dataKey="day" stroke="#766F85" fontSize={10} tickLine={false} />
                <YAxis stroke="#766F85" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#08060B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                  itemStyle={{ color: "#FF1D7E", fontSize: "11px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#FF1D7E" 
                  strokeWidth={3}
                  dot={{ r: 4, stroke: "#FF1D7E", strokeWidth: 2, fill: "#08060B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bar Chart: Most Struggled Concepts */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left h-[340px] flex flex-col justify-between">
        <h4 className="font-display font-semibold text-sm text-text-primary mb-4">Hardest Lesson Concepts</h4>
        
        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conceptsData} layout="vertical">
              <XAxis type="number" stroke="#766F85" fontSize={10} tickLine={false} />
              <YAxis dataKey="concept" type="category" stroke="#766F85" fontSize={10} tickLine={false} width={110} />
              <Tooltip
                contentStyle={{ backgroundColor: "#08060B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                itemStyle={{ color: "#F5F2FA", fontSize: "11px" }}
              />
              <Bar dataKey="count" fill="#7B2FF7" radius={[0, 4, 4, 0]} barSize={16}>
                {conceptsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
