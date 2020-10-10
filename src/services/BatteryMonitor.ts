import MqttHandler, {MqttEvent} from "./MqttHandler";
import PushNotifications from "../external/PushNotifications";

class BatteryMonitor {
  public threshold: number = 5;

  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
  }

  private messageHandler = async (message: MqttEvent) => {
    if (message.batteryStatus < this.threshold) {
      await PushNotifications.notifyBatteryEvent({
        title: `${message.sensorLocation} has low battery level (${message.batteryStatus}%)`,
        body: `Click here for more details`,
      });
    }
  }
}

export default new BatteryMonitor();
