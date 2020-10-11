import {MqttConnector} from "../external/MqttConnector";
import Paho from "paho-mqtt";
import {appendEvents, getEventKey, initStorage, updateLastEvent} from "../external/StorageInterface";
import {ObserverSubject} from "../lib/ObserverSubject";

/**
 * This manager acts as a wrapper applying business logic to the `MqttConnector` class. Where the
 * `MqttConnector` contained all of the raw data received via the MqttStream utilising Paho, this
 * manager is concerned with how we parse and utilise this data throughout the rest of the application.
 *
 * After parsing the new data, part of the responsibility of this class is to notify a `messageSubject`
 * such that all interested components can listen.
 */
export class MqttManager {
  public messageSubject = new ObserverSubject<MqttEvent>();
  public failureSubject = new ObserverSubject<Paho.MQTTError>();
  private client: MqttConnector | undefined;


  /**
   * Ensures Storage Initialised before we connect.
   */
  public constructor() {
    initStorage().then(() => this.connect());
  }

  /**
   * Establishes a new `MqttConnector` and connects to the service.
   */
  private connect() {
    this.client = new MqttConnector();
    this.client.connect();
    this.client.pahoErrorSubject.attach(this.onFailure);
    this.client.pahoMessageSubject.attach(this.onMessageArrived);
    console.log('handler connected');
  }

  /**
   * Message handler to parse the `Paho.Message`s received via the `MqttConnector`. This handler will
   * convert these messages into `MqttEvent` objects that can then be notified to the rest of the
   * application.
   *
   * @param message - Paho message to parse.
   */
  private onMessageArrived = async (message: Paho.Message) => {
    const event = new MqttEventFromCsv(message.payloadString);
    const key = getEventKey(event.sensorLocation);

    await appendEvents(key, event);
    if (event.motionStatus) await updateLastEvent(event);

    this.messageSubject.notify(event);

    if (process.env.REACT_APP_DEBUG) console.log('received message within handler', event);
  }

  /**
   * Failure handler to parse the `Paho.ErrorWithInvocationContext` failure events received via the
   * `MqttConnector`. This handler will notify the rest of the application of these error events.
   *
   * @param error - Paho error to handle.
   */
  private onFailure = (error: Paho.ErrorWithInvocationContext) => {
    console.log('failed to connect to mqtt within handler', error);
    this.failureSubject.notify(error);
  }
}

// Different outlined locations.
export type MqttLocationStrict = 'living' | 'kitchen' | 'dining' | 'toilet' | 'bedroom';
// Allowing for non-explicitly outline locations.
export type MqttLocation = MqttLocationStrict | string;
// Either on or off.
export type MqttStatus = 0 | 1;

/**
 * Defines the structure of an event received via the Mqtt Paho event stream.
 */
export interface MqttEvent {
  timestamp: Date | undefined,
  sensorLocation: MqttLocation,
  motionStatus: MqttStatus,
  batteryStatus: number,
}

/**
 * Creates a new `MqttEvent` object from a provided stream containing comma separated values.
 * This is the form that is used to send data across the raw event stream.
 */
export class MqttEventFromCsv implements MqttEvent {
  public timestamp: Date | undefined;
  public sensorLocation: MqttLocation;
  public motionStatus: MqttStatus;
  public batteryStatus: number;

  /**
   * Creates a new `MqttEvent` from a csv payload.
   *
   * @param payload - event in csv form.
   */
  constructor(payload: string) {
    // Parse CSV
    const data = payload.split(',');

    // Timestamp
    try {
      this.timestamp = new Date(data[0]);
    } catch (e) {
      console.error('Failed to parse date', e);
    }

    // Sensor Location
    this.sensorLocation = data[1];

    // Motion Status
    this.motionStatus = (parseInt(data[2]) > 0) ? 1 : 0;

    // Battery Status
    this.batteryStatus = parseInt(data[3]);
  }
}

/**
 * Creates a new `MqttEvent` object from a provided json payload. This is the form that
 * will be used to serialize the events to store persistently within local storage.
 */
export class MqttEventFromJson implements MqttEvent {
  public timestamp: Date | undefined;
  public sensorLocation: MqttLocation;
  public motionStatus: MqttStatus;
  public batteryStatus: number;

  /**
   * Creates a new `MqttEvent` from a json payload.
   *
   * @param payload - event in json form.
   */
  constructor(payload: string) {
    const {timestamp, sensorLocation, motionStatus, batteryStatus} = JSON.parse(payload);

    if (typeof timestamp === 'string')
      this.timestamp = new Date(timestamp);

    this.sensorLocation = (typeof sensorLocation === 'string') ? sensorLocation : 'Unknown';
    this.motionStatus = (motionStatus) ? 1 : 0;
    this.batteryStatus = (typeof batteryStatus === 'number') ? batteryStatus : -1;

    if (this.batteryStatus < 0) console.trace({payload});
  }
}

export class MqttEventFromObj implements MqttEvent {
  public timestamp: Date | undefined;
  public sensorLocation: MqttLocation;
  public motionStatus: MqttStatus;
  public batteryStatus: number;

  constructor(payload: any) {
    const {timestamp, sensorLocation, motionStatus, batteryStatus} = payload;

    if (typeof timestamp === 'string')
      this.timestamp = new Date(timestamp);

    this.sensorLocation = (typeof sensorLocation === 'string') ? sensorLocation : 'Unknown';
    this.motionStatus = (motionStatus) ? 1 : 0;
    this.batteryStatus = (typeof batteryStatus === 'number') ? batteryStatus : -1;

    if (this.batteryStatus < 0) console.trace({payload});
  }
}

export default new MqttManager();
