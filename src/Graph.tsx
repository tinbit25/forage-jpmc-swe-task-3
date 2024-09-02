import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

// Define the interface for component props
interface IProps {
  data: ServerRespond[], // Array of data objects received as props
}

// Extend HTMLElement to include the `load` method for Perspective Viewer
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined; // Table instance for Perspective

  render() {
    // Render the `perspective-viewer` element
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get the Perspective Viewer element from the DOM
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    // Define the schema for the Perspective table
    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',      
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    // Check if Perspective and its worker are available
    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema); // Create a new Perspective table with the schema
    }

    if (this.table) {
      // Load the table into the Perspective Viewer element
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); // Set the view type to y_line for the Perspective Viewer
      elem.setAttribute('row-pivots', '["timestamp"]'); // Set row pivots for grouping data
      elem.setAttribute('columns', '["ratio","lower_bound","upper_bound","trigger_alert"]'); // Define columns to display
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg', // Aggregate price_abc using average
        price_def: 'avg', // Aggregate price_def using average
        ratio: 'avg', // Aggregate ratio using average
        timestamp: 'distinct count', // Aggregate timestamp with distinct count
        upper_bound: 'avg', // Aggregate upper_bound using average
        lower_bound: 'avg', // Aggregate lower_bound using average
        trigger_alert: 'avg', // Aggregate trigger_alert using average
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      // Update the Perspective table with new data from props
      this.table.update([
        DataManipulator.generateRow(this.props.data), // Convert props data to the format required by Perspective
      ] as unknown as TableData );
    }
  }
}

export default Graph;
