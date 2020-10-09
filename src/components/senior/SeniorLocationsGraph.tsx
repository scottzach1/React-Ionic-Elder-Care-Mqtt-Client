import React, {FC, useRef} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {Bar} from "react-chartjs-2";
import "chartjs-plugin-datalabels";

export type LocationCountsType = { [index: string]: number };

interface Props {
  totals?: LocationCountsType,
}

const SeniorLocationsGraph: FC<Props> = (props) => {
  const chartRef = useRef(null);

  const parseData = () => {
    const {totals} = props;

    if (!totals) return;

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

    for (let key in totals) {
      if (!totals.hasOwnProperty(key) || typeof totals[key] !== "number") continue;
      data.labels.push(key);
      data.datasets[0].data.push(totals[key]);
    }

    return data;
  };

  const chartData = parseData();

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
        />
        }
      </IonCardContent>
    </IonCard>
  );
}

export default SeniorLocationsGraph;
