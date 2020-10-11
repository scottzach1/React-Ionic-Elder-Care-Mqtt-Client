import React, {FC} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {MqttEvent} from "../../services/MqttManager";
import {formatDistanceToNow} from 'date-fns';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBed, faBlender, faCouch, faQuestion, faToilet, faUtensils} from '@fortawesome/free-solid-svg-icons'

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

  let icon;

  switch (lastSeenEvent?.sensorLocation) {
    case "dining":
      icon = faUtensils;
      break;
    case "bedroom":
      icon = faBed;
      break;
    case "kitchen":
      icon = faBlender;
      break;
    case "living":
      icon = faCouch;
      break;
    case "toilet":
      icon = faToilet;
      break;
    default:
      icon = faQuestion;
      break
  }

  return (
    <IonCard>
      <FontAwesomeIcon icon={icon} size={'8x'} style={{float: 'right', padding: '7px'}}/>
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
