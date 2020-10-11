import React, {FC, useRef} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {HorizontalBar} from "react-chartjs-2";
import "chartjs-plugin-datalabels";

// An object where all keys are strings mapping to a number.
export type BatteryReadingsType = { [index: string]: number };

interface Props {
  totals?: BatteryReadingsType,
}

/**
 * This component displays a horizontal bar chart containing totals for each battery reading. This is rendered within
 * an `IonCard`.
 *
 * @param props - `Props` interface defined above.
 */
const BatteryReadingsChart: FC<Props> = (props) => {
  // Chart ref to update.
  const chartRef = useRef(null);

  /**
   * Calculates the color based on the percentage (from red (low) to green (high)).
   *
   * @param percent - the percentage to calculate color for.
   * @param isBorder - true if the color is for outline, false for infil.
   */
  const calculateColor = (percent: number, isBorder?: boolean) => {
    if (0 > percent || percent > 100) {
      if (process.env.REACT_APP_DEBUG) {
        console.error('Tried to calculate from bad reading', percent);
      }
      // Clip values to limits.
      percent = Math.min(Math.max(percent, 0), 100);
    }

    // Get the number from [0, 1].
    const decimal = percent / 100;

    const red = (1 - decimal) * 255;
    const green = decimal * 255;

    return `rgba(${red},${green},100,${(isBorder) ? 1 : 0.2})`;
  }

  /**
   * Parses the data from props and generates valid data for rendering within the chart below.
   */
  const parseData = () => {
    const {totals} = props;

    // No data to parse.
    if (!totals) return;

    // Define basic structure to use.
    let data: any = {
      labels: [],
      datasets: [{
        label: 'Battery Percentage',
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(35,99,132,0.4)',
        hoverBorderColor: 'rgba(35,99,132,1)',
        data: []
      }],
    }

    // Iterate over each key injecting corresponding values into dataset.
    for (let key in totals) {
      if (!totals.hasOwnProperty(key) || typeof totals[key] !== "number") continue;
      const reading = totals[key];
      data.labels.push(key);
      data.datasets[0].data.push(reading);
      data.datasets[0].backgroundColor.push(calculateColor(reading, false));
      data.datasets[0].borderColor.push(calculateColor(reading, true));
    }

    return data;
  };

  // Parse data if present.
  const chartData = parseData();

  // Return a card containing a horizontal bar chart of data.
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          Battery Readings
        </IonCardTitle>
        <IonCardSubtitle>
          Latest battery readings for device in each location.
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {chartData &&
        <HorizontalBar
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
    yAxes: [{
      display: true,
      ticks: {
        beginsAtZero: true,
        max: 1,
      }
    }]
  },
  legend: {
    display: false,
  },
  plugins: {
    datalabels: {
      display: (ctx: any) => {
        return !!(ctx); // true
      },
      formatter: (ctx: any, _data: any) => {
        return (ctx) ? `${ctx}%` : undefined;
      }
    }
  }
};

export default BatteryReadingsChart;
