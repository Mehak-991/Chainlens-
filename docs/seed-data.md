# ChainLens — Supply Chain Seed Data Documentation

This document describes the structure, validation constraints, and properties of the deterministic seed dataset configured for **ChainLens**.

## Dataset Composition

### Node Quantities
* **Supplier**: 15 nodes (ID prefix: `sup-`)
* **Component**: 30 nodes (ID prefix: `cmp-`)
* **Product**: 15 nodes (ID prefix: `prd-`)
* **Factory**: 8 nodes (ID prefix: `fac-`)
* **Region**: 6 nodes (ID prefix: `reg-`)
* **Industry**: 5 nodes (ID prefix: `ind-`)
* **RiskEvent**: 8 nodes (ID prefix: `risk-`)

### Relationship Quantities
* `SUPPLIES`: Supplier $\rightarrow$ Component
* `USED_IN`: Component $\rightarrow$ Product
* `PRODUCED_AT`: Product $\rightarrow$ Factory
* `LOCATED_IN`: Mapped on Suppliers and Factories to Region nodes
* `SERVES`: Supplier $\rightarrow$ Industry
* `AFFECTED_BY`: Supplier $\rightarrow$ RiskEvent
* `ALTERNATIVE_TO`: Supplier $\rightarrow$ Supplier (Pre-approved fallback channels)

## Hero Supplier: `sup-01` (Global Circuits Ltd.)

The dataset models `sup-01` as a high-risk bottleneck node for downstream supply flows. It contains:
- **Multiple components supplied**: Chip resistors, Power transistors, and the critical single-sourced Microcontroller unit `cmp-01` (MCU-X100).
- **Active disruptions**: Impacted by `risk-01` (Fab Facility Fire, Active, High severity).
- **Downstream dependencies**: Feeds directly into `prd-01` (Smart Hub v2) and `prd-02` (Industrial Controller Pro).
- **Impacted sites**: Disrupts operations across `fac-01` (Munich Assembly) and `fac-02` (Shenzhen Electronics), cascading risk into Western Europe and East Asia.
- **Fallbacks**: Has a potential alternative supplier (`sup-02`) for resistor components, and 1 pre-approved `ALTERNATIVE_TO` contract (`sup-02` $\rightarrow$ `sup-01`).

## Derived Risk Score Verification
Using the business logic formula:
$$\text{Raw Risk Score} = (\text{affected\_products} \times 2) + (\text{affected\_factories} \times 3) + (\text{single\_source\_components} \times 4) + (\text{high\_severity\_active\_events} \times 5)$$

Applying `sup-01` parameters:
* Affected Products = 2 (`prd-01`, `prd-02`) $\times 2 = 4$
* Affected Factories = 3 (`fac-01`, `fac-02`, `fac-05`) $\times 3 = 9$
* Single Source Components = 1 (`cmp-01`) $\times 4 = 4$
* High Severity Active Events = 1 (`risk-01`) $\times 5 = 5$
* **Raw Risk Score**: $4 + 9 + 4 + 5 = 22$
* **Normalized Risk Score**: $\min(100, \text{round}(22 / 1.5)) = 15$

*(Note: Raw scores map to corresponding risk tiers dynamically computed by the service layer).*
