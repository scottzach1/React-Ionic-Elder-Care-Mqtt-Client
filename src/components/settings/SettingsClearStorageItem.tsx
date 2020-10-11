import React, {FC, useState} from "react";
import {IonAlert, IonButton, IonIcon, IonItem, IonLabel, IonToast} from "@ionic/react";
import {trashBinSharp} from "ionicons/icons";
import {clearAllEvents} from "../../external/StorageInterface";

interface Props {
}

/**
 * This component provides the user functionality to clear all locally stored data from
 * local storage.
 *
 * @param props - `Props` interface defined above.
 */
const SettingsClearStorageItem: FC<Props> = (props) => {
  const [showClearAlert, setShowClearAlert] = useState<boolean>(false);
  const [showToastSuccess, setShowToastSuccess] = useState<boolean>(false);
  const [showToastFailure, setShowToastFailure] = useState<boolean>(false);

  /**
   * Handle the clear storage action. Attempts to clear storage, notifying the user of
   * status by triggering a toast.
   */
  const clearStorage = () => {
    clearAllEvents()
      .then(() => setShowToastSuccess(true))
      .catch(() => setShowToastFailure(true));
  }

  // Renders a card containing a clickable ion-item. When clicked, this will provide a prompt asking
  // the user whether they want to clear all locally persisted events. This will also trigger a toast
  // upon action resolution.
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
        message={'This will loose all locally saved event data. This may take days to replenish.'}
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
