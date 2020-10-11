import MqttHandler, {MqttEvent} from "./MqttManager";
import PushNotifications from "./PushNotifications";

class BatteryMonitor {
  public threshold: number = 20;
  public monitor: boolean = false;

  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
  }

  private messageHandler = async (message: MqttEvent) => {
    if (message.batteryStatus < this.threshold && this.monitor) {
      await PushNotifications.notifyBatteryEvent({
        title: `${message.sensorLocation} has low battery level (${message.batteryStatus}%)`,
        body: `Click here for more details`,
      });
    }
  }
}

export default new BatteryMonitor();
