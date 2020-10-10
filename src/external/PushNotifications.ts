import {Plugins} from '@capacitor/core';

const {LocalNotifications} = Plugins;

/**
 * <https://blog.chinaza.dev/ionic-react-local-notifications-using-capacitor-ckc8dv3p400byvms1d2wqcq6h>
 */
class PushNotifications {
  static counter = 0;

  public async notifyBatteryEvent(event: NotifyEvent) {
    const {title, body} = event;

    try {
      // Request/ check permissions
      if (!(await LocalNotifications.requestPermission()).granted) return;

      // Clear old notifications in prep for refresh (OPTIONAL)
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0)
        await LocalNotifications.cancel(pending);

      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: PushNotifications.counter += 1,
          schedule: {
            // For now.
            at: new Date()
          }
        }]
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export interface NotifyEvent {
  title: string,
  body: string,
}

export default new PushNotifications()
