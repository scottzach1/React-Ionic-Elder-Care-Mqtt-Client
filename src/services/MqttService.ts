import assert from "assert";
import Paho from 'paho-mqtt';

const MqttConfig = {
  address: 'test.mosquitto.org',
  port: 8080,
  topic: 'swen325/a3',
  path: '/mqtt',
  clientId: 'pSaHsOEICndfoefhHSp'
}

type MqttServiceStatus = 'Disconnected' | 'Disconnecting' | 'Connecting' | 'Connected';

export class MqttService {
  private status: MqttServiceStatus = 'Disconnected';
  private client: Paho.Client | undefined;
  private message: Paho.Message | undefined;
  private messageToSend: string = '';

  constructor() {
    console.log('mqtt service started');
    this.connect();
  }

  public disconnect() {
    if (this.status !== 'Connected') return;
    assert(this.client)

    this.status = 'Disconnecting';
    this.client.disconnect();
    this.status = 'Disconnected';
  }

  public connect() {
    const {address, port, path, clientId} = MqttConfig;

    this.status = 'Connecting';
    this.client = new Paho.Client(address, port, path, clientId);

    console.log('connecting to mqtt via websocket');
    this.client.connect({
      timeout: 10,
      useSSL: false,
      onSuccess: this.onConnect,
      onFailure: this.onFailure,
    });

    this.client.onConnectionLost = this.onConnectionLost;
    this.client.onMessageArrived = this.onMessageArrived;
  }

  public sendMessage() {
    if (this.status !== 'Connected') return;
    assert(this.client);

    const message = new Paho.Message(this.messageToSend);
    this.client?.send(message);
  }

  public onConnect = () => {
    const {topic} = MqttConfig;
    assert(this.client);

    console.log('connected to mqtt');
    this.status = 'Connected';
    this.client.subscribe(topic);
  }

  public onFailure = (error: Paho.ErrorWithInvocationContext) => {
    console.log('failed to connect to mqtt', error);
    this.status = 'Disconnected';
  }

  public onConnectionLost = (error: Paho.MQTTError) => {
    if (error.errorCode === 0) return;
    this.status = 'Disconnected';
  }

  public onMessageArrived = (message: Paho.Message) => {
    console.log('received message', message);
    this.message = message;
    console.log('event', new MqttEvent(message.payloadString));
  }
}

type MqttLocation = 'living' | 'kitchen' | 'dining' | 'toilet' | 'bedroom' | string;
type MqttStatus = 0 | 1;

class MqttEvent {
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
