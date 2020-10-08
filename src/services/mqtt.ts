import mqtt, {MqttClient} from 'mqtt';

class MqttService {
  public client: MqttClient;

  constructor() {
    this.client = mqtt.connect(process.env.REACT_APP_MQTT_URI);

    this.client.on('connect', () => {
      this.client.subscribe('presence', (err) => {
        if (!err) this.client.publish('presence', 'Hello mqtt');
      })
    });

    this.client.on('message', (topic, message) => {
      console.log(message.toString());
      this.client.end();
    })
  }
}
