import React, {useEffect, useState} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import './SeniorTab.css';
import SeniorLocationCard from "../components/senior/SeniorLocationCard";
import SeniorLocationsGraph from "../components/senior/SeniorLocationsGraph";
import mqttHandler, {MqttEvent} from "../services/MqttHandler";

const SeniorTab: React.FC = () => {
  const [latestMessage, setLatestMessage] = useState<MqttEvent>();

  const onNewMessage = (event: MqttEvent) => {
    setLatestMessage(event);
  }

  useEffect(() => {
    mqttHandler.messageSubject.attach(onNewMessage);

    // Detach when unmount
    return () => mqttHandler.messageSubject.detach(onNewMessage);
  }, []);

  const latestLocation = (latestMessage) ? latestMessage.sensorLocation : 'Unknown';

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
        <SeniorLocationCard lastSeenLocation={latestLocation} mins={5}/>
        <SeniorLocationsGraph/>
      </IonContent>
    </IonPage>
  );
};

export default SeniorTab;
