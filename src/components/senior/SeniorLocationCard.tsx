import {FC} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import React from "react";

interface Props {
  lastSeenLocation: string,
  mins: number,
}

const SeniorLocationCard: FC<Props> = (props) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          {props.lastSeenLocation} - {props.mins}m ago.
        </IonCardTitle>
        <IonCardSubtitle>
          Last seen location
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        This contains some other information about the location...
      </IonCardContent>
    </IonCard>
  );
}

export default SeniorLocationCard;
