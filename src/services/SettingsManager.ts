import {isDate} from "date-fns";
import {getUserPreferences, setUserPreferences} from "./StorageManager";
import {ObserverSubject} from "../lib/ObserverSubject";

export type NotificationSettingState = 'mute' | 'enable' | Date;

export interface Settings {
  dataExpirationAge: Duration,
  muteStatus: NotificationSettingState,
  batteryThreshold: number,
  inactivityThreshold: number,
}

export function isSettings(obj: any): obj is Settings {
  if (!obj || typeof obj !== 'object') return false;

  const {dataExpirationAge, muteStatus, batteryThreshold, inactivityThreshold} = obj;

  return 1 &&
    typeof dataExpirationAge === 'object' &&
    typeof batteryThreshold === 'number' &&
    typeof inactivityThreshold === 'number' &&
    (isDate(muteStatus) || ['mute', 'enable'].includes(muteStatus));
}

class SettingsManager {
  private settings: Settings | undefined;
  public settingsSubject: ObserverSubject<Settings>;

  constructor() {
    this.settingsSubject = new ObserverSubject<Settings>();
    this.initSettings().then();
  }

  private async initSettings() {
    // Check if settings are present
    if (this.settings) return this.settings;

    // Check stored settings
    const storedSettings: any = await getUserPreferences();

    // Inject date into object.
    if (!(['mute', 'enable', undefined].includes(storedSettings?.muteStatus))) {
      storedSettings.muteStatus = new Date(storedSettings.muteStatus);
    }

    // Check after await if settings are present
    if (this.settings) return this.settings;

    if (isSettings(storedSettings)) {
      return this.setSettings(storedSettings);
    }

    // Initialise settings in both locations.
    const settings: Settings = {
      dataExpirationAge: {
        years: 1,
      },
      muteStatus: 'enable',
      batteryThreshold: 5,
      inactivityThreshold: 10,
    }

    return this.setSettings(settings);
  }

  public async getSettings(): Promise<Settings> {
    return (this.settings) ? this.settings : await this.initSettings();
  }

  public setSettings(settings: Settings): Settings {
    if (process.env.REACT_APP_DEBUG) console.log('global settings state changed to', {settings});
    setUserPreferences(settings).then(() => this.settingsSubject.notify(settings));
    return this.settings = settings;
  }
}

export default new SettingsManager();
