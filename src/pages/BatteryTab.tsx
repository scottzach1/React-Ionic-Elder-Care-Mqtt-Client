import React, {useEffect, useState} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import BatteryReadingsChart, {BatteryReadingsType} from "../components/battery/BatteryReadingsChart";
import MqttHandler, {MqttEvent} from "../services/MqttHandler";
import {getEvents, StorageEventIndexKeys} from "../external/StorageManager";
import BatteryTrendChart, {BatteryTrendsType} from "../components/battery/BatteryTrendChart";

const BatteryTab: React.FC = () => {
    const [batteryLevels, setBatteryLevels] = useState<BatteryReadingsType>();
    const [batteryTrends, setBatteryTrends] = useState<BatteryTrendsType>();
    const [eventToParse, setEventToParse] = useState<MqttEvent | undefined>();

    const onNewMessage = (event: MqttEvent) => {
      setEventToParse(event);
    }

    useEffect(() => {
      MqttHandler.messageSubject.attach(onNewMessage);

      // Detach when unmount
      return () => MqttHandler.messageSubject.detach(onNewMessage);
    }, []);

    const countTotals = async () => {
      let totals: BatteryReadingsType = {};
      let promises: Promise<void>[] = [];

      for (let key in StorageEventIndexKeys) {
        const storageKey = StorageEventIndexKeys[key];
        const promise = getEvents(storageKey).then((res) => {
          // Read battery reading from last event.
          totals[key] = (res?.length) ? res[res.length - 1].batteryStatus : 0;
        });
        promises.push(promise);
      }

      await Promise.all(promises);

      setBatteryLevels(totals);
    }

    const calculateTrends = async () => {
      let trends: BatteryTrendsType = {};
      let promises: Promise<void>[] = [];

      for (let key in StorageEventIndexKeys) {
        const storageKey = StorageEventIndexKeys[key];
        const promise = getEvents(storageKey).then((res) => {
          trends[key] = (res?.length) ? res : [];
        });
        promises.push(promise);
      }

      await Promise.all(promises);

      setBatteryTrends(trends);
    }

    // No local counts present, calculate from local storage.
    if (!batteryLevels) countTotals().then();

    if (!batteryTrends) calculateTrends().then();

    // Outstanding event to parse, parse and update state.
    if (batteryLevels && eventToParse) {
      // This is required, as within a `useEffect` callback, a useState such as `locationCounts` is undefined due to the
      // different context. This is a workaround for this.
      if (batteryLevels) {
        let newCounts = batteryLevels;
        newCounts[eventToParse.sensorLocation] = eventToParse.batteryStatus;
        setBatteryLevels(newCounts);
      }

      if (batteryTrends) {
        let newTrends = batteryTrends;
        newTrends[eventToParse.sensorLocation].push(eventToParse);
        setBatteryTrends(newTrends);
      }

      setEventToParse(undefined);
    }

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Battery Tab</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Battery Tab</IonTitle>
            </IonToolbar>
          </IonHeader>
          <BatteryReadingsChart totals={batteryLevels}/>
          <BatteryTrendChart trends={batteryTrends}/>
        </IonContent>
      </IonPage>
    );
  }
;

export default BatteryTab;
