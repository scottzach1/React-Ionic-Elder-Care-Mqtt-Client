import {MqttEvent} from "../../services/MqttHandler";
import React, {FC, useRef} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {Line} from "react-chartjs-2";
import "chartjs-plugin-datalabels";


export type BatteryTrendsType = { [index: string]: MqttEvent[] }

interface Props {
  trends?: BatteryTrendsType,
}

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
      display: (ctx: any) => {
        return false; // true
      },
      formatter: (ctx: any, data: any) => {
        return (ctx) ? `${ctx}%` : undefined;
      }
    }
  }
}

const BatteryTrendChart: FC<Props> = (props) => {
  const chartRef = useRef(null);

  const parseData = () => {
    const {trends} = props;

    if (!trends) return;

    let data: any = {
      labels: [],
      datasets: [],
    }

    const defaultDataset: any = {
      label: 'Unknown',
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      data: []
    }

    for (let key in trends) {
      if (!trends.hasOwnProperty(key) || !Array.isArray(trends[key])) continue;
      const events = trends[key];

      let dataset = {
        ...defaultDataset,
      };

      data.labels.push(key);
      dataset.label = key;

      for (let event of events) {
        if (!event.timestamp) continue;
        const {timestamp, batteryStatus} = event;

        dataset.data.push({
          t: timestamp,
          y: batteryStatus,
        });
      }

      const offset = 100;

      const red = offset + Math.round(Math.random() * (155));
      const green = offset + Math.round(Math.random() * 155);
      const blue = offset + Math.round(Math.random() * 155);

      dataset.backgroundColor = `rgba(${red},${green},${blue}, 0.2)`;
      dataset.borderColor = `rgba(${red},${green},${blue},1)`;
      dataset.hoverBackgroundColor = `rgba(${red},${green},${blue},0.5)`;

      data.datasets.push(dataset);

      return data; // FIXME: current hack to render only one series
    }

    return data;
  }

  const chartData = parseData();

  console.log({chartData});

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

export default BatteryTrendChart;
