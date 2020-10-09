import {MqttService} from "./MqttService";
import Paho from "paho-mqtt";
import {appendEvents, getEventKey, initStorage, updateLastEvent} from "../external/StorageManager";

export class MqttHandler {
  private client: MqttService | undefined;
  private onMessageArrivedHandler: Paho.OnMessageHandler[] = [];
  private onFailureHandler: Paho.OnFailureCallback[] = [];

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

  // private addOnMessageArrivedHandler

  private onMessageArrived = async (message: Paho.Message) => {
    const event = new MqttEvent(message.payloadString);
    const key = getEventKey(event.sensorLocation);

    await appendEvents(key, event);
    await updateLastEvent(event);

    console.log('received message within handler', event);
  }

  private onFailure = (error: Paho.ErrorWithInvocationContext) => {
    console.log('failed to connect to mqtt within handler', error);
  }
}

export type MqttLocationStrict = 'living' | 'kitchen' | 'dining' | 'toilet' | 'bedroom';
export type MqttLocation = MqttLocationStrict | string;
export type MqttStatus = 0 | 1;

export class MqttEvent {
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
