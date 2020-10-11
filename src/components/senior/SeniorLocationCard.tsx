import React, {FC} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {MqttEvent} from "../../services/MqttManager";
import {formatDistanceToNow} from 'date-fns';

interface Props {
  lastSeenEvent: MqttEvent | undefined,
}

const SeniorLocationCard: FC<Props> = (props) => {
  const {lastSeenEvent} = props;

  let timeAgo;
  let location: string;

  if (lastSeenEvent) {
    timeAgo = (lastSeenEvent.timestamp) ? `${formatDistanceToNow(lastSeenEvent.timestamp)} ago` : 'time unknown';
    location = lastSeenEvent.sensorLocation;
  } else {
    location = 'Unknown';
    timeAgo = 'time unknown';
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          {location} - {timeAgo}.
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
