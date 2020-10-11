import MqttHandler, {MqttEvent} from "./MqttManager";
import PushNotifications from "./PushNotifications";
import {addMinutes, format} from "date-fns";
import {getLastEvent} from "./StorageManager";
import SettingsManager from "./SettingsManager";

class InactivityMonitor {
  private inactivityThreshold = 10;

  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
    SettingsManager.settingsSubject.attach(async (settings) => {
      this.inactivityThreshold = settings.inactivityThreshold;
      await this.messageHandler(await getLastEvent());
    });
    getLastEvent().then(this.messageHandler);
  }

  private messageHandler = async (message?: MqttEvent) => {
    if (!message || !message.motionStatus) return;
    const {inactivityThreshold} = this;
    const {timestamp} = message;

    setTimeout(async () => {
      if (inactivityThreshold !== this.inactivityThreshold) return;

      const newMessage = await getLastEvent();

      if (JSON.stringify(message) === JSON.stringify(newMessage)) {
        const timeString = (message.timestamp) ? `at ${format(message.timestamp, 'PPPPpppp')}` : 'never';

        await PushNotifications.notifyBatteryEvent({
          title: `We haven't heard a sensor update in over ${this.inactivityThreshold} minutes!`,
          body: `Last seen ${timeString}`,
        });
      }
    }, addMinutes((timestamp) ? timestamp : new Date(), 20).getTime() - new Date().getTime());
  }
}

export default new InactivityMonitor();
