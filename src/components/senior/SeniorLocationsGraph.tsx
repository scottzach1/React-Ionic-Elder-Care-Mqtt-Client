import {FC} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import React from "react";

interface Props {
}

const SeniorLocationsGraph: FC<Props> = (props) => {
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
        This contains some other information about the location...
      </IonCardContent>
    </IonCard>
  );
}

export default SeniorLocationsGraph;
