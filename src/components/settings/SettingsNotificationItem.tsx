import React, {FC, useState} from "react";
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonToast} from "@ionic/react";
import {notificationsOffOutline, notificationsOutline} from "ionicons/icons";
import PushNotifications, {PushNotificationsState} from "../../external/PushNotifications";
import {addDays, addMinutes} from "date-fns";

interface Props {
}

type NotificationState = 'Enable' | 'Mute' | 'Mute for 15 minutes' | 'Mute for a day';

const NotificationStates: { [key in NotificationState]: { icon: string, getDate: () => PushNotificationsState } } = {
  'Enable': {
    icon: notificationsOutline,
    getDate: () => 'enable'
  },
  'Mute': {
    icon: notificationsOffOutline,
    getDate: () => 'mute'
  },
  'Mute for 15 minutes': {
    icon: notificationsOffOutline,
    getDate: () => addMinutes(new Date(), 15)
  },
  'Mute for a day': {
    icon: notificationsOffOutline,
    getDate: () => addDays(new Date(), 1)
  },
}

const SettingsNotificationItem: FC<Props> = (props) => {
  const [mode, setMode] = useState<NotificationState | undefined>();
  const [showToast, setShowToast] = useState<boolean>(false);

  if (!mode) {
    setMode((PushNotifications.muteUntil === 'mute') ? 'Mute' : 'Enable');
  }

  const createOptions = () => {
    let options = [];

    for (let key in NotificationStates) {
      options.push(
        <IonSelectOption value={key} key={`option-${key}`}>{key}</IonSelectOption>
      );
    }

    return options;
  }

  return (
    <>
      <IonItem>
        <IonIcon icon={(mode) ? NotificationStates[mode].icon : notificationsOutline}/>
        <span>&nbsp;&nbsp;</span>
        <IonLabel>{(props.children) ? props.children : 'Notifications'}</IonLabel>
        <IonSelect
          interface="action-sheet"
          multiple={false}
          placeholder="Select One"
          onIonChange={(e: { detail: { value?: NotificationState } }) => {
            const mode = e.detail.value;

            if (!mode) return;

            console.log('setting date', {date: NotificationStates[mode].getDate()})
            PushNotifications.muteUntil = (NotificationStates[mode].getDate());
            setMode(mode);
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