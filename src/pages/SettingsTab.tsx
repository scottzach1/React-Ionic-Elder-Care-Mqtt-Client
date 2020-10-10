import React from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SettingsTab.css';

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
        <ExploreContainer name="Settings Tab page"/>
      </IonContent>
    </IonPage>
  );
};

export default SettingsTab;
