# ChainLens Dependency Graph Visualization

This document details the configuration, stylesheet variables, node elements deduplication, and layout architecture of the **ChainLens** interactive network engine.

## Graph Visual Library
* **Cytoscape.js** + **react-cytoscapejs** wrappers.
* Custom TypeScript type definitions are placed in `frontend/src/react-cytoscapejs.d.ts` to enforce compiler constraints.

## Nodes, Edges, & Deduplication
To translate raw path datasets into deduplicated elements, `buildGraphElements` performs the following passes:
1. **Deduplicate Nodes**: Maps nodes dynamically by checking distinct ID keys. Unique elements include `Supplier`, `Component`, `Product`, `Factory`, and `Region`.
2. **Deduplicate Edges**: Mapped by composing logical uniqueness strings: `${source}-${relationship_type}-${target}`.

## Layout & Aesthetics
* **Hierarchical Layout**: Nodes arrange using a breadth-first algorithm (`breadthfirst`) with the root supplier node highlighted at the top hierarchy layer.
* **Node Shapes & Color Maps**:
  * **Supplier**: Circle node styled with a border highlight. Color corresponds directly to the supplier's `risk_tier` value (Red: High, Yellow: Medium, Green: Low).
  * **Component**: Blue rounded-rectangle node.
  * **Product**: Purple diamond node.
  * **Factory**: Yellow triangle node.
  * **Region**: Pink hexagon node.
* **Controls**: Toolbar buttons provide Zoom (+/-), Pan, and View Fitting triggers directly using internal Cytoscape event hooks.
