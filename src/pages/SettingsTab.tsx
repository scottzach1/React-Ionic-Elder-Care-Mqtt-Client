import React, {useEffect, useState} from 'react';
import {IonCard, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import SettingsClearStorageItem from "../components/settings/SettingsClearStorageItem";
import SettingsNotificationItem from "../components/settings/SettingsNotificationItem";
import SettingsManager, {Settings} from "../services/SettingsManager";
import SettingsBatteryThresholdItem from "../components/settings/SettingsBatteryThresholdItem";
import SettingsInactivityThresholdItem from "../components/settings/SettingsInactivityThresholdItem";
import SettingsAboutItem from "../components/settings/SettingsAboutItem";

/**
 * This screen represents an entire screen of the application. This screen is used to provide an interface for
 * the user to update various different settings regarding the application.
 */
const SettingsTab: React.FC = () => {
  const [settings, setSettingsState] = useState<Settings>();
  const [, forceRerender] = useState<any>(); // Updating settings object won't rerender.

  /**
   * Callback to handle new settings changes received. Due to the finicky nature of react, updating the
   * settings state won't force a new render. Instead we are also changing another `useState` with no
   * value. :P
   *
   * @param newSettings - new settings received.
   */
  const onSettingsChange = (newSettings: Settings) => {
    setSettingsState(newSettings);
    forceRerender(new Date());
  }

  // Register / unregister new settings event handler for subject within component lifecycle.
  useEffect(() => {
    SettingsManager.settingsSubject.attach(onSettingsChange);

    // Detach when unmount.
    return () => SettingsManager.settingsSubject.detach(onSettingsChange);
  }, []);

  /**
   * Refreshes the settings within internal state with new dat from the settings manager.
   */
  const refreshSettings = async () => {
    setSettingsState(await SettingsManager.getSettings());
  }

  if (!settings) refreshSettings().then();

  // Render a screen containing cards containing intractable items to set user preferences for the application.
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings Tab</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings Tab</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* Settings Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              General
            </IonCardTitle>
          </IonCardHeader>
          <SettingsClearStorageItem/>
          <SettingsNotificationItem settings={settings}/>
          <SettingsBatteryThresholdItem settings={settings}/>
          <SettingsInactivityThresholdItem settings={settings}/>
        </IonCard>
        {/* Information Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              About
            </IonCardTitle>
          </IonCardHeader>
          <SettingsAboutItem/>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default SettingsTab;
