import React, {useEffect, useState} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import BatteryReadingsChart, {BatteryReadingsType} from "../components/battery/BatteryReadingsChart";
import MqttHandler, {MqttEvent} from "../services/MqttManager";
import {getEvents, StorageEventIndexKeys} from "../external/StorageInterface";
import BatteryTrendChart, {BatteryTrendsType} from "../components/battery/BatteryTrendChart";

/**
 * This component represents an entire screen of the application. The battery tab is used to
 * display all information about the battery levels of all of the components. This is done
 * via chart.js within child components.
 */
const BatteryTab: React.FC = () => {
    const [batteryLevels, setBatteryLevels] = useState<BatteryReadingsType>();
    const [batteryTrends, setBatteryTrends] = useState<BatteryTrendsType>();
    const [eventToParse, setEventToParse] = useState<MqttEvent | undefined>();

    /**
     * Callback to handle new events received. Due to finicky nature of react, we set this as a state to then consume.
     *
     * @param event - new event received by subject.
     */
    const onNewMessage = (event: MqttEvent) => {
      setEventToParse(event);
    }

    // Register / unregister event handler for subject within component lifecycle.
    useEffect(() => {
      MqttHandler.messageSubject.attach(onNewMessage);

      // Detach when unmount
      return () => MqttHandler.messageSubject.detach(onNewMessage);
    }, []);

    /**
     * Counts the number of readings to display within the `BatteryTrendsChart`.
     *
     * NOTE: Instead of returning the data, this will update internal state.
     */
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

      // Resolve all promises at once, (saves waiting between loop iterations).
      await Promise.all(promises);

      setBatteryLevels(totals);
    }

  /**
   * Calculates the trends to display within the the `BatteryTrends` component.
   */
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

      // Resolve all promises at once, (saves waiting between loop iterations).
      await Promise.all(promises);

      setBatteryTrends(trends);
    }

    // No local counts present, calculate from local storage.
    if (!batteryLevels) countTotals().then();

    // No trends present, calculate form local storage.
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

    // Render the battery tab screen containing two cards of information.
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
          <BatteryTrendChart trends={batteryTrends} numberOfReadings={20}/>
        </IonContent>
      </IonPage>
    );
  }
;

export default BatteryTab;
