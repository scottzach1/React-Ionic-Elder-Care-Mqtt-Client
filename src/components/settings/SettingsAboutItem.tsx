import React, {FC} from "react";
import {IonIcon, IonItem, IonLabel} from "@ionic/react";
import {logoReact} from "ionicons/icons";


const SettingsAboutItem: FC = () => {

  return (
    <>
      <IonItem>
        <IonIcon icon={logoReact}/>
        <span>&nbsp;&nbsp;</span>
        <IonLabel>Version 1.0 (alpha)</IonLabel>
      </IonItem>
      <IonItem>
        <IonLabel>
          Developed by Zac Scott for SWEN 325 IOT assignment.
        </IonLabel>
      </IonItem>
    </>
  );
}

export default SettingsAboutItem;
