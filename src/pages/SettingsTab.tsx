import React from 'react';
import {IonCard, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import SettingsClearStorageItem from "../components/settings/ClearEventsEntry";

const SettingsTab: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings Tab</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings Tab</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              General
            </IonCardTitle>
          </IonCardHeader>
          <SettingsClearStorageItem/>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default SettingsTab;
