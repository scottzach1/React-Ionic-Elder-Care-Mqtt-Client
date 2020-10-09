import {MqttService} from "./MqttService";
import Paho from "paho-mqtt";
import {appendEvents, getEventKey, initStorage, updateLastEvent} from "../external/StorageManager";
import {ObserverSubject} from "./ObserverSubject";

export class MqttHandler {
  private client: MqttService | undefined;
  public messageSubject = new ObserverSubject<MqttEvent>();
  public failureSubject = new ObserverSubject<Paho.MQTTError>()

  public constructor() {
    // Ensure Storage Initialised before we connect.
    initStorage().then(() => this.connect());
  }

  private connect() {
    this.client = new MqttService();
    this.client.connect();
    this.client.setOnFailureHandler(this.onFailure);
    this.client.setOnMessageArrivedHandler(this.onMessageArrived);
    console.log('handler connected');
  }

  private onMessageArrived = async (message: Paho.Message) => {
    const event = new MqttEventFromString(message.payloadString);
    const key = getEventKey(event.sensorLocation);

    await appendEvents(key, event);
    if (event.motionStatus) await updateLastEvent(event);

    this.messageSubject.notify(event);

    console.log('received message within handler', event);
  }

  private onFailure = (error: Paho.ErrorWithInvocationContext) => {
    console.log('failed to connect to mqtt within handler', error);
    this.failureSubject.notify(error);
  }
}

export type MqttLocationStrict = 'living' | 'kitchen' | 'dining' | 'toilet' | 'bedroom';
export type MqttLocation = MqttLocationStrict | string;
export type MqttStatus = 0 | 1;

export interface MqttEvent {
  timestamp: Date | undefined,
  sensorLocation: MqttLocation,
  motionStatus: MqttStatus,
  batteryStatus: number,
}

export class MqttEventFromString implements MqttEvent {
  public timestamp: Date | undefined;
  public sensorLocation: MqttLocation;
  public motionStatus: MqttStatus;
  public batteryStatus: number;

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

export class MqttEventFromJson implements MqttEvent {
  public timestamp: Date | undefined;
  public sensorLocation: MqttLocation;
  public motionStatus: MqttStatus;
  public batteryStatus: number;

  constructor(payload: string) {
    const {timestamp, sensorLocation, motionStatus, batteryStatus} = JSON.parse(payload);

    if (typeof timestamp === 'string')
      this.timestamp = new Date(timestamp);

    this.sensorLocation = (typeof sensorLocation === 'string') ? sensorLocation : 'Unknown';
    this.motionStatus = (motionStatus) ? 1 : 0;
    this.batteryStatus = (typeof batteryStatus === 'number') ? batteryStatus : -1;
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
  }
}

const mqttHandler = new MqttHandler();

export {mqttHandler};
