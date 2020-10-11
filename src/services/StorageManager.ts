import {Plugins} from '@capacitor/core';
import {MqttEvent, MqttEventFromJson, MqttEventFromObj} from "./MqttManager";

const {Storage} = Plugins;

/**
 * Keys used to index all values handled by this storage manager.
 */
export const StorageEventIndexKeys: { [index: string]: string } = {
  bedroom: '@bedroomEvents',
  living: '@livingEvents',
  toilet: '@toiletEvents',
  kitchen: '@kitchenEvents',
  dining: '@diningEvents',
  other: '@otherEvents',
}

export const StorageOtherKeys = {
  lastSeenEvent: '@lastSeenEvent',
  userSettings: '@userSettings',
}

//// EVENT HELPER FUNCTIONS ////

/**
 * Gets the StorageKey associated with a given event. If the key cannot be found,
 * then the key for index `other` will be used instead.
 *
 * @param key - the key to index within local storage.
 */
export const getEventKey = (key: string) => {
  const storageKey = StorageEventIndexKeys[key];

  return (storageKey) ? storageKey : StorageEventIndexKeys.other;
}

/**
 * Initialise empty arrays for all storage key entries within local storage.
 *
 * TODO: This may be broken!
 */
export const initStorage = async () => {
  const promises: Promise<any>[] = [];

  for (let key in StorageEventIndexKeys) {
    const storageKey = StorageEventIndexKeys[key];
    if (await getEvents(storageKey)) continue;

    promises.push(setEvents(storageKey, []));
  }

  await Promise.all(promises);
}

/**
 * Gets all of the values for a given key.
 *
 * @param key - the key to lookup local storage.
 */
export const getEvents = async (key: string): Promise<MqttEvent[] | null> => {
  const result = await Storage.get({key: key});
  if (!result.value) return null;
  let array = JSON.parse(result.value);
  return array.map((val: any) => new MqttEventFromObj(val));
}

/**
 * Sets an array of events for the given key.
 *
 * @param key - the key to index in local storage.
 * @param value - the value to set.
 */
export const setEvents = async (key: string, value: MqttEvent[]) => {
  await Storage.set({
    key: key,
    value: JSON.stringify(value),
  }).catch((e) => console.error('Failed to set events', {key, value}, e));
}

/**
 * Appends an item within a list of events for a given key.
 *
 * Note: This will wipe the value stored with the given key if it is non-array.
 *
 * @param key - the key to lookup local storage.
 * @param value - the value to append to the entry.
 */
export const appendEvents = async (key: string, value: MqttEvent) => {
  let events = await getEvents(key);
  if (!Array.isArray(events)) {
    console.error('Entry was not an array', {key, result: events});
    events = [];
  }
  events.push(value);

  await setEvents(key, events);
}

/**
 * Clears all values for a given key within local storage.
 *
 * Note: This will reset the corresponding value to an empty array `[]`.
 *
 * @param key - the key to lookup local storage.
 */
export const clearEvents = async (key: string) => {
  await setEvents(key, []);
}

/**
 * Clears events for all storage keys.
 *
 * Note: This will reset the corresponding value to an empty array `[]`.
 */
export const clearAllEvents = async () => {
  const promises: Promise<any>[] = [];

  for (let key in StorageEventIndexKeys) {
    const storageKey = StorageEventIndexKeys[key];
    promises.push(clearEvents(storageKey));
  }

  await Promise.all(promises);
}

/**
 * Updates the last event within local storage.
 *
 * @param event - the event to store as 'last even' persistently.
 */
export const updateLastEvent = async (event: MqttEvent) => {
  await Storage.set({
    key: StorageOtherKeys.lastSeenEvent,
    value: JSON.stringify(event)
  });
}

/**
 * Gets the last event stored within local storage.
 */
export const getLastEvent = async (): Promise<MqttEvent | any> => {
  const resp = await Storage.get({key: StorageOtherKeys.lastSeenEvent});
  return (resp.value) ? new MqttEventFromJson(resp.value) : null;
}

//// USER PREFERENCES FUNCTIONS ////

export const getUserPreferences = async (): Promise<any> => {
  // Extract value from response.
  const {value} = await Storage.get({key: StorageOtherKeys.userSettings});
  // Parse as JSON if non-null;
  return (value) ? JSON.parse(value) : value;
}

export const setUserPreferences = async (settings: any): Promise<any> => {
  // Wait and update storage.
  await Storage.set({
    key: StorageOtherKeys.userSettings,
    value: JSON.stringify(settings)
  }).catch((e) => console.error('Failed to store new settings', e));
  // Return stored value.
  return settings;
}
