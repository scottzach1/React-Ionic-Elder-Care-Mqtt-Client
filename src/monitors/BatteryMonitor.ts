import MqttHandler, {MqttEvent} from "../services/MqttManager";
import PushNotifications from "../external/PushNotifications";
import SettingsManager from "../services/SettingsManager";
import {getLastEvent} from "../external/StorageInterface";

/**
 * This monitor is responsible for monitoring the incoming messages and sending notifications
 * if a certain battery level threshold is met. To observe the message stream, this class will
 * subscribe to the `MqttManager` event stream. This class also observes the settings stream
 * and will update internal state based on upstream changes. This approach mitigates any issues
 * such as getting out of sync.
 */
class BatteryMonitor {
  public threshold: number = 20;

  /**
   * Attaches callback to event stream to handle new messages, then updates itself with latest message.
   * To maintain state, we also subscribe to the settings stream such that we can update ourselves with
   * new battery monitor states from upstream changes.
   */
  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
    SettingsManager.settingsSubject.attach((settings) => {
      this.threshold = settings.batteryThreshold;
    });
    getLastEvent().then(this.messageHandler);
  }

  /**
   * Sets the threshold state by setting a new global setting. This will then be handled by the settings
   * stream callback attached within the constructor.
   *
   * @param level - level to set.
   */
  public async setThreshold(level: number) {
    let settings = await SettingsManager.getSettings();
    settings.batteryThreshold = level;
    await SettingsManager.setSettings(settings);
    return this.threshold = level;
  }

  /**
   * Handles all incoming messages. If a message meets a certain battery level threshold, then we invoke
   * a push notification alerting the user of the anomaly.
   *
   * @param message - the message to handle.
   */
  private messageHandler = async (message?: MqttEvent) => {
    if (message && message.batteryStatus < this.threshold) {
      await PushNotifications.notifyBatteryEvent({
        title: `${message.sensorLocation} has low battery level (${message.batteryStatus}%)`,
        body: `Click here for more details`,
      });
    }
  }
}

export default new BatteryMonitor();
