import React, {FC, useRef} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {Bar} from "react-chartjs-2";
import "chartjs-plugin-datalabels";

export type LocationCountsType = { [index: string]: number };

interface Props {
  totals?: LocationCountsType,
}

/**
 * This component displays a vertical bar chart containing the count totals for each location where
 * activity has been observed. This is rendered within an `IonCard`.
 * @param props
 */
const SeniorLocationsGraph: FC<Props> = (props) => {
  // Chart ref to update.
  const chartRef = useRef(null);

  /**
   * Parses the data from props and generates valid data for reading within the chart below.
   */
  const parseData = () => {
    const {totals} = props;

    // No data to parse.
    if (!totals) return;

    // Define basic structure to use.
    let data: any = {
      labels: [],
      datasets: [{
        label: 'Totals per location',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
        data: []
      }],
    }

    // Iterate over each key injecting corresponding values into dataset.
    for (let key in totals) {
      if (!totals.hasOwnProperty(key) || typeof totals[key] !== "number") continue;
      data.labels.push(key);
      data.datasets[0].data.push(totals[key]);
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
          Locations Seen
        </IonCardTitle>
        <IonCardSubtitle>
          Totals for each location hits in last 'n' amount of time.
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {chartData &&
        <Bar
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
  legend: {
    display: false,
  },
};

export default SeniorLocationsGraph;
