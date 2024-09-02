import { ServerRespond } from './DataStreamer';

// Define the interface for a single row of data
export interface Row {
  price_abc: number;       // Average price of stock ABC
  price_def: number;       // Average price of stock DEF
  ratio: number;           // Ratio of price_abc to price_def
  timestamp: Date;         // Timestamp of the data
  upper_bound: number;     // Upper bound threshold for the ratio
  lower_bound: number;     // Lower bound threshold for the ratio
  trigger_alert: number | undefined; // Ratio value if it crosses the bounds, otherwise undefined
}

export class DataManipulator {
  // Static method to generate a Row object from server response data
  static generateRow(serverRespond: ServerRespond[]): Row {
    // Calculate the average price for stock ABC
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    // Calculate the average price for stock DEF
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    // Calculate the ratio of price_abc to price_def
    const ratio = priceABC / priceDEF;
    // Define the upper and lower bounds for the ratio
    const upperBound = 1 + 0.05; // 5% above 1
    const lowerBound = 1 - 0.05; // 5% below 1

    // Return the Row object with calculated values
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp
        ? serverRespond[0].timestamp // Choose the later timestamp
        : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined, // Set trigger_alert if ratio crosses bounds
    };
  }
}
