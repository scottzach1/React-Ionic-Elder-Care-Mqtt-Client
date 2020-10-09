import React, {Component, RefObject} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {Bar} from "react-chartjs-2";

export type LocationCountsType = { [index: string]: number };

interface Props {
  totals?: LocationCountsType,
}

interface State {
  chartRef: RefObject<Bar>
  // chartData: any,
}

class SeniorLocationsGraph extends Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);

    this.state = {
      chartRef: React.createRef(),
      // chartData: null,
    }
  }

  componentDidMount() {
    console.log('reference', this.state.chartRef);
  }

  parseData() {
    const {totals} = this.props;

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
    };

    for (let key in totals) {
      if (!totals.hasOwnProperty(key) || typeof totals[key] !== "number") continue;
      data.labels.push(key);
      data.datasets[0].data.push(totals[key]);
    }

    console.log({data});

    return data;
  }

  render() {
    const {chartRef} = this.state;
    const chartData = this.parseData();

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
}

export default SeniorLocationsGraph;
