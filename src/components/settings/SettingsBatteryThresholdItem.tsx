import React, {FC} from "react";
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption} from "@ionic/react";
import {batteryHalfOutline} from "ionicons/icons";
import {Settings} from "../../services/SettingsManager";
import BatteryMonitor from "../../services/BatteryMonitor";

interface Props {
  settings?: Settings,
}

const SettingsBatteryThresholdItem: FC<Props> = (props) => {
  const {settings, children} = props;
  const mode = settings?.muteStatus;

  const createOptions = () => {
    let options = [];

    options.push(
      <IonSelectOption value={-1} key={`option-off-percent`}>Off</IonSelectOption>
    );

    for (let i = 0; i <= 30; i += 5) {
      options.push(
        <IonSelectOption value={i} key={`option-${i}-percent`}>{i}%</IonSelectOption>
      );
    }

    return options;
  }

  const getText = () => {
    if (!settings?.batteryThreshold) return 'Select Below';
    const {batteryThreshold} = settings;

    if (batteryThreshold < 0) return `Off`;
    else return `${settings.batteryThreshold}%`
  }

  return (
    <>
      <IonItem>
        <IonIcon icon={batteryHalfOutline}/>
        <span>&nbsp;&nbsp;</span>
        <IonLabel>{(children) ? children : 'Battery Alerts'}</IonLabel>
        <IonSelect
          interface="action-sheet"
          multiple={false}
          placeholder={getText()}
          onIonChange={async (e) => {
            const value = e.detail.value;
            if (typeof value !== 'number') return;
            await BatteryMonitor.setThreshold(value);
          }}
          value={mode}
        >
          {createOptions()}
        </IonSelect>
      </IonItem>
    </>
  );
}

export default SettingsBatteryThresholdItem;
