import React, {FC} from "react";
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption} from "@ionic/react";
import {notificationsOffOutline, notificationsOutline} from "ionicons/icons";
import PushNotifications, {NotificationOptions, NotificationStates} from "../../services/PushNotifications";
import {Settings} from "../../services/SettingsManager";
import {formatDistanceToNow} from "date-fns";

interface Props {
  settings?: Settings,
}

/**
 * Helper method to capitalize the first letter of a string.
 *
 * @param text - input string.
 */
const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const SettingsNotificationItem: FC<Props> = (props) => {
  const {settings, children} = props;
  const mode = settings?.muteStatus;

  const getNotificationText = () => {
    if (!mode) return 'Select One';

    let text;

    if (typeof mode === 'string')
      text = mode;
    else if (!PushNotifications.checkState())
      text = 'enabled';
    else
      text = `muted for ${formatDistanceToNow(mode)}`

    return capitalizeFirstLetter(text);
  }

  const createOptions = () => {
    return NotificationStates.map((opt: NotificationOptions) => (
      <IonSelectOption value={opt} key={`option-${opt}`}>{opt}</IonSelectOption>
    ));
  }

  const getIcon = () => {
    return (PushNotifications.checkState()) ? notificationsOffOutline : notificationsOutline;
  }

  return (
    <>
      <IonItem>
        <IonIcon icon={getIcon()}/>
        <span>&nbsp;&nbsp;</span>
        <IonLabel>{(children) ? children : 'Notifications'}</IonLabel>
        <IonSelect
          interface="action-sheet"
          multiple={false}
          placeholder={getNotificationText()}
          onIonChange={async (e: { detail: { value?: NotificationOptions } }) => {
            const mode = e.detail.value;
            if (!mode) return;

            await PushNotifications.muteUntil(mode);
          }}
          value={mode}
        >
          {createOptions()}
        </IonSelect>
      </IonItem>
    </>
  );
}

export default SettingsNotificationItem;
