import {MqttEvent} from "../../services/MqttManager";
import React, {FC, useRef} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {Line} from "react-chartjs-2";
import "chartjs-plugin-datalabels";

// An object where all keys are strings mapping to a list of events.
export type BatteryTrendsType = { [index: string]: MqttEvent[] }

interface Props {
  trends?: BatteryTrendsType,
  numberOfReadings?: number, // default 20
}

// Defines a type to store color mappings between renders.
type Rgb = { red: number, green: number, blue: number };

// Indexes labels with color mappings to store between renders.
const labelColors: { [index: string]: Rgb } = {};

/**
 * This component displays a line chart containing the battery level trends for each location
 * within a `IonCard`. The chart will contain a different legend and color for each different
 * location in series.
 *
 * @param props - `Props` interface defined above.
 */
const BatteryTrendChart: FC<Props> = (props) => {
  // Chart ref to update.
  const chartRef = useRef(null);
  // The number of readings to show within the graph.
  const numberOfReadings = (props.numberOfReadings) ? props.numberOfReadings : 20;

  /**
   * Gets the RDB color for a corresponding key. This will first check whether color base has
   * been stored within the label colors above. This prevents the graph from changing colors
   * between renders.
   *
   * @param key - the key to associate with color.
   */
  const getRGB = (key: string): Rgb => {
    if (labelColors[key]) return labelColors[key];

    // Set min value, such that the colors are never too dark.
    const offset = 100;

    const red = offset + Math.round(Math.random() * (155));
    const green = offset + Math.round(Math.random() * 155);
    const blue = offset + Math.round(Math.random() * 155);

    const rgb: Rgb = {red, green, blue};

    // Store external to component for persistence between renders.
    labelColors[key] = rgb;
    return rgb;
  }

  /**
   * Parses the data from props and generates valid data for rendering within the chart below.
   */
  const parseData = () => {
    const {trends} = props;

    if (!trends) return;

    // Structure to contain data for all keys.
    let data: any = {
      labels: [],
      datasets: [],
    }

    for (let key in trends) {
      // No data to parse.
      if (!trends.hasOwnProperty(key) || !Array.isArray(trends[key])) continue;
      // No entry (other), avoid showing in chart.
      if (!trends[key].length) continue;

      // Events to add to dataset.
      let events = trends[key];

      // Get indexed color.
      const {red, green, blue} = getRGB(key);

      // Define basic structure to use.
      let dataset: any = {
        label: key,
        borderWidth: 1,
        pointHitRadius: 0,
        backgroundColor: `rgba(${red},${green},${blue}, 0.2)`,
        borderColor: `rgba(${red},${green},${blue},1)`,
        hoverBackgroundColor: `rgba(${red},${green},${blue},0.5)`,
        data: []
      }

      // Iterate over events, inserting valid ones to dataset.
      events.forEach((event, index) => {
        const {timestamp, batteryStatus} = event;
        // Check whether we should include this entry. Ideally we only want to display
        // `numberOfReadings`.
        if (
          timestamp && (
          (events.length < numberOfReadings) ||
          (index === events.length - 1) ||
          (index) % Math.round((events.length) / numberOfReadings) === 0)
        ) {
          // Insert into dataset.
          dataset.data.push({
            x: timestamp,
            y: batteryStatus,
          });
        }
      });

      // Add entire dataset to collective dataset..
      data.datasets.push(dataset);
    }

    // Return all data (all datasets and labels).
    return data;
  }

  // Parse data if present.
  const chartData = parseData();

  // Return a card containing a line chart of data.
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          Battery Trends
        </IonCardTitle>
        <IonCardSubtitle>
          Battery Readings over time
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {chartData &&
        <Line
            ref={chartRef}
            data={chartData}
            options={options}
        />
        }
      </IonCardContent>
    </IonCard>
  );
}

// Constant options provided to graph above.
const options = {
  scales: {
    xAxes: [{
      type: 'time',
      distribution: 'series',
      // distribution: 'linear',
      time: {
        unit: 'minute',
        // displayFormats: {
        //   minute: 'h:mm a',
        // }
      }
    }]
  },
  plugins: {
    datalabels: {
      display: (_ctx: any) => {
        return false; // true
      },
      formatter: (ctx: any, _data: any) => {
        return (ctx) ? `${ctx}%` : undefined;
      }
    }
  }
}


export default BatteryTrendChart;
