import React, { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import { DependencyPath } from "../services/api";

interface DependencyGraphProps {
  paths: DependencyPath[];
  selectedSupplierId: string;
  riskTier: string;
}

export const buildGraphElements = (paths: DependencyPath[], selectedSupplierId: string) => {
  const nodeMap = new Map<string, { id: string; label: string; name: string }>();
  const edgeSet = new Set<string>();
  const elements: any[] = [];

  paths.forEach((path) => {
    path.nodes.forEach((node) => {
      if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
    });
    for (let i = 0; i < path.nodes.length - 1; i++) {
      const source = path.nodes[i].id;
      const target = path.nodes[i + 1].id;
      const rel = path.relationships[i];
      const edgeKey = `${source}-${rel}-${target}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        elements.push({ data: { id: edgeKey, source, target, relationship: rel } });
      }
    }
  });

  nodeMap.forEach((node) => {
    const isRoot = node.id === selectedSupplierId;
    elements.push({ data: { id: node.id, label: node.name, type: node.label, isRoot } });
  });

  return elements;
};

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ paths, selectedSupplierId, riskTier }) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ id: string; type: string; label: string } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<{ source: string; target: string; type: string } | null>(null);

  const elements = buildGraphElements(paths, selectedSupplierId);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || elements.length === 0) return;

    cy.elements().remove();
    cy.add(elements);
    cy.resize();

    const layout = cy.layout({
      name: "breadthfirst",
      directed: true,
      padding: 50,
      spacingFactor: 2.2,
      nodeDimensionsIncludeLabels: true,
      animate: true,
      animationDuration: 400,
      fit: false
    } as any);

    layout.one("layoutstop", () => {
      cy.resize();
      cy.fit(cy.elements(), 40);
    });

    layout.run();
  }, [paths, selectedSupplierId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const cy = cyRef.current;
      if (!cy) return;
      cy.resize();
      if (cy.elements().length > 0) cy.fit(cy.elements(), 40);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const getSupplierColor = () => {
    if (riskTier.toUpperCase() === "HIGH") return "#ef4444";
    if (riskTier.toUpperCase() === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  const cytoscapeStylesheet: any[] = [
    { selector: "node", style: { "label": "data(label)", "color": "#d1d5db", "font-size": "12px", "text-valign": "bottom", "text-halign": "center", "text-margin-y": 8, "text-max-width": "100px", "text-wrap": "ellipsis", "background-color": "#4b5563", "width": "36px", "height": "36px", "border-color": "#1f2937", "border-width": "2px", "overlay-opacity": 0 } },
    { selector: "node[type=\"Supplier\"]", style: { "background-color": getSupplierColor(), "width": "48px", "height": "48px", "border-color": "#f3f4f6", "border-width": "3px", "font-size": "13px" } },
    { selector: "node[type=\"Component\"]", style: { "background-color": "#60a5fa", "shape": "round-rectangle", "width": "38px", "height": "38px" } },
    { selector: "node[type=\"Product\"]", style: { "background-color": "#a78bfa", "shape": "diamond", "width": "38px", "height": "38px" } },
    { selector: "node[type=\"Factory\"]", style: { "background-color": "#fbbf24", "shape": "triangle", "width": "38px", "height": "38px" } },
    { selector: "node[type=\"Region\"]", style: { "background-color": "#f472b6", "shape": "hexagon", "width": "38px", "height": "38px" } },
    { selector: "edge", style: { "width": 2, "line-color": "#4b5563", "target-arrow-color": "#4b5563", "target-arrow-shape": "triangle", "curve-style": "bezier", "control-point-step-size": 20, "arrow-scale": 1.1, "overlay-opacity": 0 } },
    { selector: "node:selected", style: { "border-color": "#ffffff", "border-width": "4px", "color": "#ffffff" } },
    { selector: "edge:selected", style: { "line-color": "#60a5fa", "target-arrow-color": "#60a5fa", "width": 4 } }
  ];

  const handleCy = React.useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;
    cy.removeAllListeners();
    cy.on("tap", (evt) => { if (evt.target === cy) { setSelectedNode(null); setSelectedEdge(null); } });
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      setSelectedEdge(null);
      setSelectedNode({ id: node.data("id"), type: node.data("type"), label: node.data("label") });
    });
    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      setSelectedNode(null);
      setSelectedEdge({ source: edge.data("source"), target: edge.data("target"), type: edge.data("relationship") });
    });
  }, []);

  const handleFit = () => { if (cyRef.current) cyRef.current.fit(cyRef.current.elements(), 40); };
  const handleZoomIn = () => { if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25); };
  const handleZoomOut = () => { if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8); };

  if (paths.length === 0) {
    return (
      <div style={{ padding: "3rem", backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px", color: "#9ca3af", marginBottom: "2rem" }}>
        No downstream dependency paths found for this supplier.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid #374151", paddingBottom: "1rem" }}>
        <div style={{ textAlign: "left" }}>
          <h3 style={{ fontSize: "1.2rem", margin: 0, color: "#f3f4f6", fontWeight: 700 }}>Downstream Dependency Network</h3>
          <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Interactive path tracing from supplier downstream nodes</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleZoomIn} style={btnStyle}>Zoom +</button>
          <button onClick={handleZoomOut} style={btnStyle}>Zoom -</button>
          <button onClick={handleFit} style={btnStyle}>Fit Graph</button>
        </div>
      </div>

      {/* Graph canvas + Node Inspector side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div ref={containerRef} style={{ backgroundColor: "#111827", borderRadius: "8px", border: "1px solid #2d3748", height: "420px", position: "relative", overflow: "hidden" }}>
          <CytoscapeComponent elements={[]} style={{ width: "100%", height: "100%" }} stylesheet={cytoscapeStylesheet} cy={handleCy} layout={{ name: "preset" }} />
        </div>

        <div style={{ backgroundColor: "#111827", borderRadius: "8px", border: "1px solid #2d3748", padding: "1.25rem", display: "flex", flexDirection: "column", textAlign: "left" }}>
          <h4 style={{ fontSize: "0.95rem", margin: "0 0 1rem 0", color: "#f3f4f6", borderBottom: "1px solid #2d3748", paddingBottom: "0.5rem", fontWeight: 700 }}>Selected Node Inspector</h4>
          {selectedNode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
              <div><span style={labelStyle}>Node Type:</span> <strong style={{ color: "#e5e7eb" }}>{selectedNode.type}</strong></div>
              <div><span style={labelStyle}>Label / Name:</span> <strong style={{ color: "#60a5fa" }}>{selectedNode.label}</strong></div>
              <div><span style={labelStyle}>Entity ID:</span> <span style={{ fontFamily: "monospace", color: "#9ca3af" }}>{selectedNode.id}</span></div>
            </div>
          )}
          {selectedEdge && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
              <div><span style={labelStyle}>Link Type:</span> <strong style={{ color: "#a78bfa" }}>{selectedEdge.type}</strong></div>
              <div><span style={labelStyle}>Source Node:</span> <span style={{ fontFamily: "monospace", color: "#9ca3af" }}>{selectedEdge.source}</span></div>
              <div><span style={labelStyle}>Target Node:</span> <span style={{ fontFamily: "monospace", color: "#9ca3af" }}>{selectedEdge.target}</span></div>
            </div>
          )}
          {!selectedNode && !selectedEdge && <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Click a node or relationship link in the graph canvas to inspect properties.</span>}
        </div>
      </div>

      {/* Legend bar — full width below */}
      <div style={{ backgroundColor: "#111827", borderRadius: "8px", border: "1px solid #2d3748", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af", fontWeight: 700 }}>Graph Legend</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.8rem" }}>
          <div style={legendItem}><span style={{ ...legendDot, backgroundColor: getSupplierColor() }} /> Supplier</div>
          <div style={legendItem}><span style={{ ...legendDot, backgroundColor: "#60a5fa" }} /> Component</div>
          <div style={legendItem}><span style={{ ...legendDot, backgroundColor: "#a78bfa" }} /> Product</div>
          <div style={legendItem}><span style={{ ...legendDot, backgroundColor: "#fbbf24" }} /> Factory</div>
          <div style={legendItem}><span style={{ ...legendDot, backgroundColor: "#f472b6" }} /> Region</div>
        </div>
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = { padding: "0.4rem 0.8rem", borderRadius: "6px", backgroundColor: "#374151", color: "#f3f4f6", border: "1px solid #4b5563", cursor: "pointer", fontSize: "0.8rem" };
const labelStyle: React.CSSProperties = { color: "#9ca3af", display: "inline-block", width: "100px" };
const legendItem: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.25rem", color: "#e5e7eb" };
const legendDot: React.CSSProperties = { width: "10px", height: "10px", borderRadius: "2px", display: "inline-block" };
