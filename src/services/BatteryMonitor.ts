import MqttHandler, {MqttEvent} from "./MqttManager";
import PushNotifications from "./PushNotifications";
import SettingsManager from "./SettingsManager";

class BatteryMonitor {
  public threshold: number = 20;

  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
    SettingsManager.settingsSubject.attach((settings) => {
      this.threshold = settings.batteryThreshold;
    });
  }

  public async setThreshold(level: number) {
    let settings = await SettingsManager.getSettings();
    settings.batteryThreshold = level;
    await SettingsManager.setSettings(settings);
    return this.threshold = level;
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
