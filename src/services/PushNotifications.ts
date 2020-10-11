import {Plugins} from '@capacitor/core';
import {addDays, addSeconds, isDate} from "date-fns";
import SettingsManager, {NotificationSettingState, Settings} from "./SettingsManager";
import {ObserverSubject} from "../lib/ObserverSubject";

export type NotificationOptions = 'Enable' | 'Mute' | 'Mute for 15 minutes' | 'Mute for a day';
export const NotificationStates: NotificationOptions[] = ['Enable', 'Mute', 'Mute for 15 minutes', 'Mute for a day'];

const {LocalNotifications} = Plugins;

/**
 * <https://blog.chinaza.dev/ionic-react-local-notifications-using-capacitor-ckc8dv3p400byvms1d2wqcq6h>
 */
class PushNotifications {
  static counter = 0;

  private state: NotificationSettingState | undefined;
  public notificationSubject = new ObserverSubject<NotificationSettingState>();

  constructor() {
    SettingsManager.settingsSubject.attach(this.onSettingsChange);
    this.getState().then();
  }

  public async getState() {
    if (this.state) return this.state;
    const newStatus = (await SettingsManager.getSettings()).muteStatus;
    return (this.state) ? this.state : await this.setState(newStatus);
  }

  public checkState() {
    const {state} = this;
    const muted = (state) && (isDate(state) && state > new Date());
    if (!muted && isDate(state)) {
      SettingsManager.getSettings().then((settings) => {
        settings.muteStatus = 'enable';
        SettingsManager.setSettings(settings);
      });
    }
    return muted;
  }

  public async muteUntil(option: NotificationOptions) {
    switch (option) {
      case 'Enable':
        await this.setState('enable');
        break;
      case 'Mute':
        await this.setState('mute');
        break;
      case 'Mute for 15 minutes':
        // await this.setState(addMinutes(new Date(), 15));
        await this.setState(addSeconds(new Date(), 5));
        break;
      case 'Mute for a day':
        await this.setState(addDays(new Date(), 1));
        break
    }

    let newSettings = await SettingsManager.getSettings();
    newSettings.muteStatus = await this.getState();
    await SettingsManager.setSettings(newSettings);
  }

  public async notifyBatteryEvent(event: NotifyEvent) {
    const {title, body} = event;

    // Check that we aren't currently muted.
    if (this.checkState()) return;

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
            at: new Date(), // NOW
          }
        }]
      });
    } catch (error) {
      console.error(error);
    }
  }

  private setState(state: NotificationSettingState) {
    if (process.env.REACT_APP_DEBUG) console.log('push notification state changed to', {state});
    setTimeout(() => this.notificationSubject.notify(state), 0);
    return this.state = state;
  }

  private onSettingsChange = (settings: Settings) => {
    const {muteStatus} = settings;
    this.setState(muteStatus);
    // Schedule a callback to check the time on expire.
    if ((isDate(muteStatus) && muteStatus > new Date())) {
      setTimeout(() => {
        this.checkState();
      }, (new Date(muteStatus).getTime() - new Date().getTime()));
    }
  }
}

export interface NotifyEvent {
  title: string,
  body: string,
}

export default new PushNotifications()
