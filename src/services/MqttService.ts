import assert from "assert";
import {ErrorWithInvocationContext, Message, MQTTError} from "paho-mqtt";

const MqttConfig = {
  address: 'http://test.mosquito.org',
  port: 8080,
  topic: 'swen325/a3',
  path: '/mqtt',
  clientId: 'p{?{Qy6CK)r!4y-p'
}

type MqttServiceStatus = 'Disconnected' | 'Disconnecting' | 'Connecting' | 'Connected';

export class MqttService {
  private status: MqttServiceStatus = 'Disconnected';
  private client: Paho.MQTT.Client | undefined;
  private message: Paho.MQTT.Message | undefined;
  private messageToSend: string = '';

  constructor() {
  }

  public disconnect() {
    if (this.status !== 'Connected') return;

    this.status = 'Disconnecting';
    this.client?.disconnect();
    this.status = 'Disconnected';
  }

  public connect() {
    const {address, port, path, clientId} = MqttConfig;

    this.status = 'Connecting';
    this.client = new Paho.MQTT.Client(address, port, path, clientId);

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

    const message = new Paho.MQTT.Message(this.messageToSend);
    this.client?.send(message);
  }

  public onConnect = () => {
    const {topic} = MqttConfig;
    assert(this.client);

    console.log('connected to mqtt');
    this.status = 'Connected';
    this.client.subscribe(topic);
  }

  public onFailure = (error: ErrorWithInvocationContext) => {
    console.log('failed to connect to mqtt', error);
    this.status = 'Disconnected';
  }

  public onConnectionLost = (error: MQTTError) => {
    if (error.errorCode === 0) return;
    this.status = 'Disconnected';
  }

  public onMessageArrived = (message: Message) => {
    console.log('received message', message);
    this.message = message;
  }
}
