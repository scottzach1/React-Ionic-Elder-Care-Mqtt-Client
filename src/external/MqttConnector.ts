import assert from "assert";
import Paho from 'paho-mqtt';
import {ObserverSubject} from "../lib/ObserverSubject";

// Server details.
const MqttConfig = {
  address: 'test.mosquitto.org',
  port: 8080,
  topic: 'swen325/a3',
  path: '/mqtt',
  clientId: 'pSaHsOEISOecCEEndfoeSOUCDHhEzsE'
}

// Different states the client may be in.
type MqttServiceStatus = 'Disconnected' | 'Disconnecting' | 'Connecting' | 'Connected';

/**
 * This class is used to maintain and handle the connection with the Mqtt event feed by utilising the
 * Eclipse Paho library. This is meant to abstract the complexity and state away from the rest of the
 * application.
 *
 * This structure was inspired from the example provided within the tutorial material.
 */
export class MqttConnector {
  private status: MqttServiceStatus = 'Disconnected';
  private client: Paho.Client | undefined;

  public pahoMessageSubject = new ObserverSubject<Paho.Message>();
  public pahoErrorSubject = new ObserverSubject<Paho.ErrorWithInvocationContext>();

  /**
   * Default Constructor.
   */
  constructor() {
    if (process.env.REACT_APP_DEBUG) console.log('mqtt service started');
  }

  /**
   * Disconnects gracefully from the Mqtt even feed.
   */
  public disconnect() {
    if (this.status !== 'Connected') return;
    assert(this.client)

    this.status = 'Disconnecting';
    this.client.disconnect();
    this.status = 'Disconnected';
  }

  /**
   * Connects to the Mqtt event feed via a new Paho client.
   */
  public connect() {
    const {address, port, path, clientId} = MqttConfig;

    // Create client.
    this.status = 'Connecting';
    this.client = new Paho.Client(address, port, path, clientId);

    if (process.env.REACT_APP_DEBUG) console.log('connecting to mqtt via websocket');

    // Connect to event feed.
    this.client.connect({
      timeout: 10,
      useSSL: false,
      onSuccess: this.onConnect,
      onFailure: this.onFailure,
    });

    // Attach callbacks on actions.
    this.client.onConnectionLost = this.onConnectionLost;
    this.client.onMessageArrived = this.onMessageArrived;
  }

  /**
   * Triggered when the client connects to event feed.
   */
  public onConnect = () => {
    const {topic} = MqttConfig;
    assert(this.client);

    if (process.env.REACT_APP_DEBUG) console.log('connected to mqtt');
    this.status = 'Connected';
    this.client.subscribe(topic);
  }

  /**
   * Triggered when the client fails unexpectedly.
   *
   * @param error - received by client.
   */
  public onFailure = (error: Paho.ErrorWithInvocationContext) => {
    if (process.env.REACT_APP_DEBUG) console.log('failed to connect to mqtt', error);
    this.status = 'Disconnected';

    this.pahoErrorSubject.notify(error);

    // if (this.onFailureHandler) this.onFailureHandler(error);
  }

  /**
   * Triggered when the client disconnects unexpectedly from the event feed.
   * @param error - received by client.
   */
  public onConnectionLost = (error: Paho.MQTTError) => {
    if (error.errorCode === 0) return;
    this.status = 'Disconnected';
  }

  /**
   * Triggered when the client receives a new message from event feed.
   *
   * @param message - the message received.
   */
  public onMessageArrived = (message: Paho.Message) => {
    this.pahoMessageSubject.notify(message);
  }
}
