import React, {FC} from "react";
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption} from "@ionic/react";
import {notificationsOffOutline, notificationsOutline} from "ionicons/icons";
import PushNotifications, {NotificationOptions, NotificationStates} from "../../external/PushNotifications";
import {Settings} from "../../services/SettingsManager";
import {formatDistanceToNow} from "date-fns";

interface Props {
  settings?: Settings,
}

/**
 * This component provides the user functionality to manually override the notification
 * status throughout the application. As well as turn off or on, the user can also chose
 * to sleep for a given amount of time. This component will then dynamically show the amount
 * of time notifications have been slept until (instead of the user selected value). This
 * will change based on how far away the target time is.
 *
 * @param props - `Props` interface defined above.
 */
const SettingsNotificationItem: FC<Props> = (props) => {
  const {settings, children} = props;
  const mode = settings?.muteStatus;

  /**
   * Calculates the text to show within the placeholder location of the selector.
   */
  const getNotificationText = () => {
    if (!mode) return 'Select One';

    let text;

    // value is string, must be 'enabled' or 'muted'.
    if (typeof mode === 'string')
      text = mode;
    // Checks whether the component is muted.
    else if (!PushNotifications.checkMuted())
      text = 'enabled';
    // Calculate time away from now.
    else
      text = `muted for ${formatDistanceToNow(mode)}`

    return capitalizeFirstLetter(text);
  }

  /**
   * Generate the options to show within the ion-select menu.
   */
  const createOptions = () => {
    return NotificationStates.map((opt: NotificationOptions) => (
      <IonSelectOption value={opt} key={`option-${opt}`}>{opt}</IonSelectOption>
    ));
  }

  /**
   * Dynamically selects an icon to display based on the mute status.
   */
  const getIcon = () => {
    return (PushNotifications.checkMuted()) ? notificationsOffOutline : notificationsOutline;
  }

  // Returns an `IonItem` containing an ion-select that can be used to select the notification status.
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

/**
 * Helper method to capitalize the first letter of a string.
 *
 * @param text - input string.
 */
const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default SettingsNotificationItem;
