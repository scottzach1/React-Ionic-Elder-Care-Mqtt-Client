import React, {FC} from "react";
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption} from "@ionic/react";
import {batteryHalfOutline} from "ionicons/icons";
import {Settings} from "../../services/SettingsManager";
import BatteryMonitor from "../../monitors/BatteryMonitor";

interface Props {
  settings?: Settings,
}

/**
 * This component provides the user functionality to manually select the minimum battery alert
 * threshold, as well as outright disable it.
 *
 * To handle state, this component does not store internal state, but instead updates dynamically
 * based on the data shown within the settings prop.
 *
 * @param props - `Props` interface defined above.
 */
const SettingsBatteryThresholdItem: FC<Props> = (props) => {
  const {settings, children} = props;
  const mode = settings?.muteStatus; // may be `undefined`.

  /**
   * Generate the options to show within the ion-select menu.
   */
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

  /**
   * Calculates the text to show within the placeholder location of the selector.
   */
  const getText = () => {
    if (!settings?.batteryThreshold) return 'Select Below';
    const {batteryThreshold} = settings;

    if (batteryThreshold < 0) return `Off`;
    else return `${batteryThreshold}%`
  }

  // Returns an `IonItem` containing an ion-select that can be used to update the battery
  // alert threshold.
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
