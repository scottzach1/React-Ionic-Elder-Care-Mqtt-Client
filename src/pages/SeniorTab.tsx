import React, {useEffect, useState} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import './SeniorTab.css';
import SeniorLocationCard from "../components/senior/SeniorLocationCard";
import SeniorLocationsGraph from "../components/senior/SeniorLocationsGraph";
import {MqttEvent, mqttHandler} from "../services/MqttHandler";
import {getEvents, getLastEvent, StorageEventKeys} from "../external/StorageManager";

type LocationCounts = { [index: string]: number };

const SeniorTab: React.FC = () => {
  const [lastSeenLocation, setLastSeenLocation] = useState<MqttEvent>();
  const [locationCounts, setLocationCounts] = useState<LocationCounts>();

  const onNewMessage = (event: MqttEvent) => {
    if (event.motionStatus) setLastSeenLocation(event);
    if (locationCounts) locationCounts[event.sensorLocation] += 1;
  }

  useEffect(() => {
    mqttHandler.messageSubject.attach(onNewMessage);

    // Detach when unmount
    return () => mqttHandler.messageSubject.detach(onNewMessage);
  }, []);

  const countTotals = async () => {
    let totals: LocationCounts = {};
    let promises: Promise<void>[] = [];

    for (let key in StorageEventKeys) {
      const storageKey = StorageEventKeys[key];
      const promise = getEvents(storageKey).then((res) => {
        totals[key] = (res) ? res.length : 0
      });
      promises.push(promise);
    }

    await Promise.all(promises);

    setLocationCounts(totals);
  }

  if (!lastSeenLocation) getLastEvent().then((event) => setLastSeenLocation(event));
  if (!locationCounts) countTotals().then();

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
        <SeniorLocationsGraph totals={locationCounts}/>
      </IonContent>
    </IonPage>
  );
};

export default SeniorTab;
