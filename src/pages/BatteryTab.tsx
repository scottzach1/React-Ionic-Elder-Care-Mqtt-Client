import React, {useEffect, useState} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import './BatteryTab.css';
import BatteryReadings, {BatteryReadingsType} from "../components/battery/BatteryReadings";
import {MqttEvent, mqttHandler} from "../services/MqttHandler";
import {getEvents, StorageEventKeys} from "../external/StorageManager";

const BatteryTab: React.FC = () => {
  const [batteryLevels, setBatteryLevels] = useState<BatteryReadingsType>();
  const [eventToParse, setEventToParse] = useState<MqttEvent | undefined>();

  const onNewMessage = (event: MqttEvent) => {
    setEventToParse(event);
  }

  useEffect(() => {
    mqttHandler.messageSubject.attach(onNewMessage);

    // Detach when unmount
    return () => mqttHandler.messageSubject.detach(onNewMessage);
  }, []);

  const countTotals = async () => {
    let totals: BatteryReadingsType = {};
    let promises: Promise<void>[] = [];

    for (let key in StorageEventKeys) {
      const storageKey = StorageEventKeys[key];
      const promise = getEvents(storageKey).then((res) => {
        // Read battery reading from last event.
        totals[key] = (res) ? res[res.length - 1].batteryStatus : 0;
      });
      promises.push(promise);
    }

    await Promise.all(promises);

    setBatteryLevels(totals);
  }

  // No local counts present, calculate from local storage.
  if (!batteryLevels) countTotals().then();

  // Outstanding event to parse, parse and update state.
  if (batteryLevels && eventToParse) {
    // This is required, as within a `useEffect` callback, a useState such as `locationCounts` is undefined due to the
    // different context. This is a workaround for this.
    let newCounts = batteryLevels;
    newCounts[eventToParse.sensorLocation] = eventToParse.batteryStatus;
    setBatteryLevels(newCounts);
    setEventToParse(undefined);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>
        <BatteryReadings totals={batteryLevels}/>
      </IonContent>
    </IonPage>
  );
};

export default BatteryTab;
