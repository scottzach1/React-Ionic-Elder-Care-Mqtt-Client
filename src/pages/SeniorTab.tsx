import React, {useEffect, useState} from 'react';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import SeniorLocationCard from "../components/senior/SeniorLocationCard";
import SeniorLocationsGraph from "../components/senior/SeniorLocationsGraph";
import MqttHandler, {MqttEvent} from "../services/MqttManager";
import {getEvents, getLastEvent, StorageEventIndexKeys} from "../external/StorageInterface";

type LocationCounts = { [index: string]: number };

/**
 * This component represents the main screen of the application. The senior tab is used to display information
 * concerning the detected activity of the subject. Within this screen we display information related to the
 * last detected event containing activity, as well as a total count of the amount of activity observed for each
 * location.
 */
const SeniorTab: React.FC = () => {
  const [lastSeenLocation, setLastSeenLocation] = useState<MqttEvent>();
  const [locationCounts, setLocationCounts] = useState<LocationCounts>();
  const [eventToParse, setEventToParse] = useState<MqttEvent | undefined>();

  /**
   * Callback to handle new events received. Due to finicky nature of react, we set this as a state to then consume.
   *
   * @param event - new event received by subject.
   */
  const onNewMessage = (event: MqttEvent) => {
    if (event.motionStatus) setLastSeenLocation(event);
    setEventToParse(event);
  }

  // Register / unregister event handler for subject within component lifecycle.
  useEffect(() => {
    MqttHandler.messageSubject.attach(onNewMessage);

    // Detach when unmount
    return () => MqttHandler.messageSubject.detach(onNewMessage);
  }, []);

  /**
   * Counts the number of active readings to display within the `SeniorLocationsGraph`.
   *
   * NOTE: Instead of returning the data, this will update internal state.
   */
  const countTotals = async () => {
    let totals: LocationCounts = {};
    let promises: Promise<void>[] = [];

    for (let key in StorageEventIndexKeys) {
      const storageKey = StorageEventIndexKeys[key];
      const promise = getEvents(storageKey).then((res) => {
        totals[key] = (res) ? res.filter((ev) => ev.motionStatus).length : 0
      });
      promises.push(promise);
    }

    await Promise.all(promises);

    setLocationCounts(totals);
  }

  // No last seen information, fetch from local storage.
  if (!lastSeenLocation) getLastEvent().then((event) => setLastSeenLocation(event));

  // No local counts present, calculate from local storage.
  if (!locationCounts) countTotals().then();

  // Outstanding event to parse, parse and update state.
  if (locationCounts && eventToParse) {
    // This is required, as within a `useEffect` callback, a useState such as `locationCounts` is undefined due to the
    // different context. I could not figure out how to add as a dependency for the callback function.
    if (eventToParse.motionStatus) {
      let newCounts = locationCounts;
      newCounts[eventToParse.sensorLocation] += 1;
      setLocationCounts(newCounts);
    }
    setEventToParse(undefined);
  }

  // Render the senior tab screen containing two cards of information.
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
