import React, {useEffect, useState} from 'react';
import {IonCard, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import SettingsClearStorageItem from "../components/settings/SettingsClearStorageItem";
import SettingsNotificationItem from "../components/settings/SettingsNotificationItem";
import SettingsManager, {Settings} from "../services/SettingsManager";
import SettingsBatteryThresholdItem from "../components/settings/SettingsBatteryThresholdItem";
import SettingsInactivityThresholdItem from "../components/settings/SettingsInactivityThresholdItem";
import SettingsAboutItem from "../components/settings/SettingsAboutItem";

const SettingsTab: React.FC = () => {
  const [settings, setSettingsState] = useState<Settings>();
  const [, forceRerender] = useState<any>();

  const onSettingsChange = (newSettings: Settings) => {
    setSettingsState(newSettings);
    forceRerender(new Date());
  }

  useEffect(() => {
    SettingsManager.settingsSubject.attach(onSettingsChange);

    return () => SettingsManager.settingsSubject.detach(onSettingsChange);
  }, []);

  const refreshSettings = async () => {
    setSettingsState(await SettingsManager.getSettings());
  }

  if (!settings) refreshSettings().then();

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
