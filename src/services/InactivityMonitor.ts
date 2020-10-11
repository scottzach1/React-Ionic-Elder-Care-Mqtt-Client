import MqttHandler, {MqttEvent} from "./MqttManager";
import PushNotifications from "./PushNotifications";
import {addMinutes, format} from "date-fns";
import {getLastEvent} from "./StorageManager";
import SettingsManager from "./SettingsManager";

class InactivityMonitor {
  private threshold = 5;

  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
    SettingsManager.settingsSubject.attach(async (settings) => {
      this.threshold = settings.inactivityThreshold;
      await this.messageHandler(await getLastEvent());
    });
    getLastEvent().then(this.messageHandler);
  }

  public async setThreshold(level: number) {
    let settings = await SettingsManager.getSettings();
    settings.inactivityThreshold = level;
    await SettingsManager.setSettings(settings);
    return this.threshold = level;
  }

  private messageHandler = async (message?: MqttEvent) => {
    if (!message || !message.motionStatus || this.threshold < 0) return;
    console.log('checking ducks', message);
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
