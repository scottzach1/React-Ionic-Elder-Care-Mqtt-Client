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

  private onMessageArrivedHandler: Paho.OnMessageHandler | undefined;
  private onFailureHandler: Paho.OnFailureCallback | undefined;

  constructor() {
    if (process.env.DEBUG) console.log('mqtt service started');
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

    if (process.env.DEBUG) console.log('connecting to mqtt via websocket');
    this.client.connect({
      timeout: 10,
      useSSL: false,
      onSuccess: this.onConnect,
      onFailure: this.onFailure,
    });

    this.client.onConnectionLost = this.onConnectionLost;
    this.client.onMessageArrived = this.onMessageArrived;
  }

  public onConnect = () => {
    const {topic} = MqttConfig;
    assert(this.client);

    if (process.env.DEBUG) console.log('connected to mqtt');
    this.status = 'Connected';
    this.client.subscribe(topic);
  }

  public onFailure = (error: Paho.ErrorWithInvocationContext) => {
    if (process.env.DEBUG) console.log('failed to connect to mqtt', error);
    this.status = 'Disconnected';

    if (this.onFailureHandler) this.onFailureHandler(error);
  }

  public onConnectionLost = (error: Paho.MQTTError) => {
    if (error.errorCode === 0) return;
    this.status = 'Disconnected';
  }

  public onMessageArrived = (message: Paho.Message) => {
    if (process.env.DEBUG) console.log('received message', message);

    if (this.onMessageArrivedHandler) this.onMessageArrivedHandler(message);
  }

  public setOnMessageArrivedHandler(callback: Paho.OnMessageHandler) {
    this.onMessageArrivedHandler = callback;
  }

  public setOnFailureHandler(callback: Paho.OnFailureCallback) {
    this.onFailure = callback;
  }
}
