import React, {useEffect, useState} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import './SeniorTab.css';
import SeniorLocationCard from "../components/senior/SeniorLocationCard";
import SeniorLocationsGraph from "../components/senior/SeniorLocationsGraph";
import {MqttEvent, mqttHandler} from "../services/MqttHandler";
import {getLastEvent} from "../external/StorageManager";

const SeniorTab: React.FC = () => {
  const [lastSeenLocation, setLastSeenLocation] = useState<MqttEvent>();

  const onNewMessage = (event: MqttEvent) => {
    if (event.motionStatus) setLastSeenLocation(event);
  }

  useEffect(() => {
    mqttHandler.messageSubject.attach(onNewMessage);

    // Detach when unmount
    return () => mqttHandler.messageSubject.detach(onNewMessage);
  }, []);

  if (!lastSeenLocation) getLastEvent().then((event) => setLastSeenLocation(event));

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
        <SeniorLocationCard lastSeenEvent={lastSeenLocation}/>
        <SeniorLocationsGraph/>
      </IonContent>
    </IonPage>
  );
};

export default SeniorTab;
