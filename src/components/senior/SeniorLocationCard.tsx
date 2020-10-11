import React, {FC} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from "@ionic/react";
import {MqttEvent} from "../../services/MqttManager";
import {format, formatDistanceToNow} from 'date-fns';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBed, faBlender, faCouch, faQuestion, faToilet, faUtensils} from '@fortawesome/free-solid-svg-icons'

interface Props {
  lastSeenEvent: MqttEvent | undefined,
}

/**
 * This component displays information about the last location activity was detected. This is presented
 * within an `IonCard` and contains both the location, the time of the event as well as an icon representing
 * the respective location.
 *
 * @param props - `Props` interface defined above.
 */
const SeniorLocationCard: FC<Props> = (props) => {
  const {lastSeenEvent} = props;

  let timeAgo: string, location: string;

  // Calculate information to display based off provided event from props.
  if (lastSeenEvent) {
    timeAgo = (lastSeenEvent.timestamp) ? `${formatDistanceToNow(lastSeenEvent.timestamp)} ago` : 'time unknown';
    location = lastSeenEvent.sensorLocation;
  } else {
    location = 'Unknown';
    timeAgo = 'time unknown';
  }

  // Select an appropriate icon based off location.
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

  location = capitalizeFirstLetter(location);

  // Return a card containing text and an icon forced to the right.
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
        {lastSeenEvent?.timestamp ? format(lastSeenEvent.timestamp, 'PPPPpppp') : 'Nothing to see here'}
      </IonCardContent>
    </IonCard>
  );
}

/**
 * Helper method to capitalize the first letter of a string.
 *
 * @param text - input string.
 */
const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default SeniorLocationCard;
