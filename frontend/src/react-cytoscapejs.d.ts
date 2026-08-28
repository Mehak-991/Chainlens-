declare module 'react-cytoscapejs' {
  import { Component } from 'react';
  import cytoscape from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: cytoscape.ElementDefinition[];
    style?: React.CSSProperties;
    layout?: cytoscape.LayoutOptions;
    stylesheet?: cytoscape.Stylesheet[];
    className?: string;
    cy?: (cy: cytoscape.Core) => void;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
}
