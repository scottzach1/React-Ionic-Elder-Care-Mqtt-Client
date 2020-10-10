import React, {FC, useRef} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {HorizontalBar} from "react-chartjs-2";
import "chartjs-plugin-datalabels";

export type BatteryReadingsType = { [index: string]: number };

interface Props {
  totals?: BatteryReadingsType,
}

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
      formatter: (ctx: any, data: any) => {
        return (ctx) ? `${ctx}%` : undefined;
      }
    }
  }
};

const BatteryReadingsChart: FC<Props> = (props) => {
  const chartRef = useRef(null);

  const calculateColor = (percent: number, border: boolean) => {
    if (0 > percent || percent > 100) {
      console.error('Tried to calculate from bad reading', percent);
    }

    const decimal = percent / 100;

    const red = (1 - decimal) * 255;
    const green = decimal * 255;

    return `rgba(${red},${green},100,${(border) ? 1 : 0.2})`;
  }

  const parseData = () => {
    const {totals} = props;

    if (!totals) return;

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

  const chartData = parseData();

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

export default BatteryReadingsChart;
