import MqttHandler, {MqttEvent} from "../services/MqttManager";
import PushNotifications from "../external/PushNotifications";
import {addMinutes, format} from "date-fns";
import {getLastEvent} from "../external/StorageInterface";
import SettingsManager from "../services/SettingsManager";

/**
 * This monitor is responsible for monitoring the incoming messages and sending notifications
 * if a certain duration of time passes without seeing a new event with the `motionStatus`
 * raised. To observe the message stream, this class will subscribe to the `MqttManager`
 * event stream. This class also observes the settings stream and will update internal state
 * based on upstream changes. This approach mitigates any issues such as getting out of sync.
 */
class InactivityMonitor {
  private threshold = 5;

  /**
   * Attaches callback to event stream to handle new messages, then updates itself with latest
   * message. To maintain state, we also subscribe to the settings stream such that we can update
   * ourselves with new battery monitor states form upstream changes.
   */
  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
    SettingsManager.settingsSubject.attach(async (settings) => {
      this.threshold = settings.inactivityThreshold;
      await this.messageHandler(await getLastEvent());
    });
    getLastEvent().then(this.messageHandler);
  }

  /**
   * Sets the threshold state by settings a new global setting. This will then be handled by the
   * settings stream callback attached within the constructor.
   *
   * @param level - level to set.
   */
  public async setThreshold(level: number) {
    let settings = await SettingsManager.getSettings();
    settings.inactivityThreshold = level;
    await SettingsManager.setSettings(settings);
    return this.threshold = level;
  }

  /**
   * Handles all incoming messages. For each incoming message, if the message contained a raised
   * `motionStatus` flag, then we schedule a timeout to occur after `threshold` minutes. Once woken
   * we check whether we need to send a push notification alerting the user of the anomaly.
   *
   * @param message - the message to handle.
   */
  private messageHandler = async (message?: MqttEvent) => {
    if (!message || !message.motionStatus || this.threshold < 0) return;
    const {threshold} = this;
    const {timestamp} = message;

    setTimeout(async () => {
      if (threshold !== this.threshold) return;
      const newMessage = await getLastEvent();

      if (JSON.stringify(message) === JSON.stringify(newMessage)) {
        const timeString = (message.timestamp) ? `at ${format(message.timestamp, 'PPPPpppp')}` : 'never';

        await PushNotifications.notifyBatteryEvent({
          title: `We haven't heard a sensor update in over ${this.threshold} minutes!`,
          body: `Last seen ${timeString}`,
        });
      }
    }, addMinutes((timestamp) ? timestamp : new Date(), threshold).getTime() - new Date().getTime());
  }
}

export default new InactivityMonitor();
