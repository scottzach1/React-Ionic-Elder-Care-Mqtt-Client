import React from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import './SeniorTab.css';
import SeniorLocationCard from "../components/senior/SeniorLocationCard";
import SeniorLocationsGraph from "../components/senior/SeniorLocationsGraph";

const SeniorTab: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Senior Tab</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Senior Tab</IonTitle>
          </IonToolbar>
        </IonHeader>
        <SeniorLocationCard lastSeenLocation={"Toilet"} mins={5}/>
        <SeniorLocationsGraph/>
      </IonContent>
    </IonPage>
  );
};

export default SeniorTab;
