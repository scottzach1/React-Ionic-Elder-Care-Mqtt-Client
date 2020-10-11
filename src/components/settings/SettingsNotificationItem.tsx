import React, {FC, useState} from "react";
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonToast} from "@ionic/react";
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
  const [showToast, setShowToast] = useState<boolean>(false);
  // const [notificationText, setNotificationText] = useState<string>("Select One");

  const {settings, children} = props;
  const mode = settings?.muteStatus;

  const getNotificationText = () => {
    if (!mode) return 'Select One';

    const text = (typeof mode === 'string') ? mode : `Muted for ${formatDistanceToNow(mode)}`

    return capitalizeFirstLetter(text);
  }

  const createOptions = () => {
    return NotificationStates.map((opt: NotificationOptions) => (
      <IonSelectOption value={opt} key={`option-${opt}`}>{opt}</IonSelectOption>
    ));
  }

  const getIcon = () => {
    return (PushNotifications.currentlyMuted()) ? notificationsOffOutline : notificationsOutline;
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
            setShowToast(true);
          }}
          value={mode}
        >
          {createOptions()}
        </IonSelect>
      </IonItem>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={"Success"}
        duration={1200}
      />
    </>
  );
}

export default SettingsNotificationItem;
