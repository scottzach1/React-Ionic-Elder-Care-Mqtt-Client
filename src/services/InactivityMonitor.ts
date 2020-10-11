import MqttHandler, {MqttEvent} from "./MqttManager";
import PushNotifications from "./PushNotifications";
import {addMinutes, format} from "date-fns";
import {getLastEvent} from "./StorageManager";

class InactivityMonitor {
  private timeout = 20;

  constructor() {
    MqttHandler.messageSubject.attach(this.messageHandler);
    getLastEvent().then(this.messageHandler);
  }

  private messageHandler = async (message?: MqttEvent) => {
    if (!message || !message.motionStatus) return;

    setTimeout(async () => {
      const newMessage = await getLastEvent();

      if (JSON.stringify(message) === JSON.stringify(newMessage)) {
        const timeString = (message.timestamp) ? `at ${format(message.timestamp, 'PPPPpppp')}` : 'never';

        await PushNotifications.notifyBatteryEvent({
          title: `We haven't heard a sensor update in over ${this.timeout} minutes!`,
          body: `Last seen ${timeString}`,
        });
      }
    }, addMinutes(new Date(), 20).getTime() - new Date().getTime());
  }
}

export default new InactivityMonitor();
