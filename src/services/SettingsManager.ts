import {isDate} from "date-fns";
import {getUserPreferences, setUserPreferences} from "../external/StorageInterface";
import {ObserverSubject} from "../lib/ObserverSubject";

export type NotificationSettingState = 'mute' | 'enable' | Date;

/**
 * The structure of settings data to be passed throughout application.
 */
export interface Settings {
  dataExpirationAge: Duration,
  muteStatus: NotificationSettingState,
  batteryThreshold: number,
  inactivityThreshold: number,
}

/**
 * Custom TypeGuard to check whether an object is a Settings object.
 *
 * @param obj - object to check.
 */
export function isSettings(obj: any): obj is Settings {
  if (!obj || typeof obj !== 'object') return false;

  const {dataExpirationAge, muteStatus, batteryThreshold, inactivityThreshold} = obj;

  return 1 &&
    typeof dataExpirationAge === 'object' &&
    typeof batteryThreshold === 'number' &&
    typeof inactivityThreshold === 'number' &&
    (isDate(muteStatus) || ['mute', 'enable'].includes(muteStatus));
}

/**
 * This class is used to maintain and handle the settings to be used throughout the application.
 * This class will maintain any changes made to the settings persistently via the local storage,
 * as well as notify the rest of the application about any changes in settings via the
 * `settingsSubject`.
 */
class SettingsManager {
  private settings: Settings | undefined;
  public settingsSubject = new ObserverSubject<Settings>();

  /**
   * Initialises settings from local storage asynchronously.
   */
  constructor() {
    this.initSettings().then();
  }

  /**
   * Checks the local settings asynchronously and atomically.
   *
   * If the settings are present, then this will gracefully return, otherwise it will attempt to
   * collect and parse the settings from local storage before setting state and notifying any
   * observers. Will resort to creating new data with defaults if none is present.
   */
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
      inactivityThreshold: 5,
    }

    return this.setSettings(settings);
  }

  /**
   * Gets the settings from internal state, if not present, then this will initialise the storage
   * and return the new settings.
   */
  public async getSettings(): Promise<Settings> {
    return (this.settings) ? this.settings : await this.initSettings();
  }

  /**
   * Updates the settings both internally, within local storage before notifying any observers of
   * the change.
   *
   * @param settings - the new settings to set.
   */
  public setSettings(settings: Settings): Settings {
    if (process.env.REACT_APP_DEBUG) console.log('global settings state changed to', {settings});
    setUserPreferences(settings).then(() => this.settingsSubject.notify(settings));
    return this.settings = settings;
  }
}

export default new SettingsManager();
