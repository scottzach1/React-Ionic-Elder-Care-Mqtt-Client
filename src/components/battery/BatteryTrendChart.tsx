import {MqttEvent} from "../../services/MqttHandler";
import React, {FC, useRef, useState} from "react";
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

type Rgb = { red: number, green: number, blue: number };

const labelColors: { [index: string]: Rgb } = {};

const BatteryTrendChart: FC<Props> = (props) => {
  const chartRef = useRef(null);
  // const [labelColors, setLabelColors] = useState<{ [index: string]: Rgb }>({});

  const getRGB = (key: string): Rgb => {
    if (labelColors[key]) return labelColors[key];

    const offset = 100;

    const red = offset + Math.round(Math.random() * (155));
    const green = offset + Math.round(Math.random() * 155);
    const blue = offset + Math.round(Math.random() * 155);

    const rgb: Rgb = {red, green, blue};

    // const newLabelColors = labelColors;
    // newLabelColors[key] = rgb;
    // setLabelColors(newLabelColors);
    labelColors[key] = rgb;

    return rgb;
  }

  const parseData = () => {
    const {trends} = props;

    if (!trends) return;

    let data: any = {
      labels: [],
      datasets: [],
    }

    for (let key in trends) {
      if (!trends.hasOwnProperty(key) || !Array.isArray(trends[key])) continue;
      const events = trends[key];

      const {red, green, blue} = getRGB(key);

      let dataset: any = {
        label: key,
        borderWidth: 1,
        pointHitRadius: 0,
        backgroundColor: `rgba(${red},${green},${blue}, 0.2)`,
        borderColor: `rgba(${red},${green},${blue},1)`,
        hoverBackgroundColor: `rgba(${red},${green},${blue},0.5)`,
        data: []
      }

      data.labels.push(key);

      for (let event of events) {
        if (!event.timestamp) continue;
        const {timestamp, batteryStatus} = event;

        dataset.data.push({
          x: timestamp,
          y: batteryStatus,
        });
      }

      data.datasets.push(dataset);
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
