import React, {FC, useState} from "react";
import {IonAlert, IonButton, IonIcon, IonItem, IonLabel, IonToast} from "@ionic/react";
import {trashBinSharp} from "ionicons/icons";
import {clearAllEvents} from "../../external/StorageManager";

interface Props {
}

const SettingsClearStorageItem: FC<Props> = (props) => {
  const [showClearAlert, setShowClearAlert] = useState<boolean>(false);
  const [showToastSuccess, setShowToastSuccess] = useState<boolean>(false);
  const [showToastFailure, setShowToastFailure] = useState<boolean>(false);

  const clearStorage = () => {
    clearAllEvents()
      .then(() => setShowToastSuccess(true))
      .catch(() => setShowToastFailure(true));
  }

  return (
    <>
      <IonItem
        onClick={() => setShowClearAlert(true)}
      >
        <IonIcon icon={trashBinSharp}/>
        <span>&nbsp;&nbsp;</span>
        <IonLabel>{props.children ? props.children : 'Clear Event Storage'}</IonLabel>
        <IonButton expand="block"><IonLabel>Clear</IonLabel></IonButton>
      </IonItem>
      <IonAlert
        isOpen={showClearAlert}
        onDidDismiss={() => setShowClearAlert(false)}
        header={'Clear Storage'}
        subHeader={'Are you sure?'}
        message={'This will loose all user saved preferences such as saved stops, services and selected theme.'}
        buttons={[{text: 'Cancel', role: 'cancel'}, {
          text: 'Clear',
          handler: clearStorage
        }]}
      />
      <IonToast
        isOpen={showToastSuccess}
        onDidDismiss={() => setShowToastSuccess(false)}
        message={"Success"}
        duration={1200}
      />
      <IonToast
        isOpen={showToastFailure}
        onDidDismiss={() => setShowToastFailure(false)}
        color={"danger"}
        message={"Failure"}
        duration={1200}
      />
    </>
  );
}

export default SettingsClearStorageItem;