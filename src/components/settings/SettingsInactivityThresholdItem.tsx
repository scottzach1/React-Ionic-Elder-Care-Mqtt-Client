import React, {FC} from "react";
import {IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption} from "@ionic/react";
import {alertCircleOutline} from "ionicons/icons";
import {Settings} from "../../services/SettingsManager";
import InactivityMonitor from "../../monitors/InactivityMonitor";

interface Props {
  settings?: Settings,
}

/**
 * This component provides the user functionality to manually select the inactivity alert
 * threshold, as well as outright disable it.
 *
 * TO handle state, this component does not store internal state, but instead updates dynamically
 * based on the data shown within the settings prop.
 *
 * @param props - `Props` interface defined above.
 */
const SettingsInactivityThresholdItem: FC<Props> = (props) => {
  const {settings, children} = props;
  const mode = settings?.muteStatus;

  /**
   * Generate the options to show within the ion-select menu.
   */
  const createOptions = () => {
    let options = [];

    options.push(
      <IonSelectOption value={-1} key={`option-off-minutes`}>Off</IonSelectOption>
    );

    for (let i of [1, 2, 3, 4, 5, 10, 15, 20, 30]) {
      options.push(
        <IonSelectOption value={i} key={`option-${i}-minutes`}>{i} Minutes</IonSelectOption>
      );
    }

    return options;
  }

  /**
   * Calculates the text to show within th placeholder location of the selector.
   */
  const getText = () => {
    if (!settings) return 'Select Below';
    const {inactivityThreshold} = settings;

    if (inactivityThreshold < 0) return `Off`;
    else return `${inactivityThreshold} Minutes`
  }

  // Returns an `IonItem` containing an ion-select that cna be used to update the inactivity
  // alert threshold.
  return (
    <>
      <IonItem>
        <IonIcon icon={alertCircleOutline}/>
        <span>&nbsp;&nbsp;</span>
        <IonLabel>{(children) ? children : 'Inactivity Alerts'}</IonLabel>
        <IonSelect
          interface="action-sheet"
          multiple={false}
          placeholder={getText()}
          onIonChange={async (e) => {
            const value = e.detail.value;
            if (typeof value !== 'number') return;
            await InactivityMonitor.setThreshold(value);
          }}
          value={mode}
        >
          {createOptions()}
        </IonSelect>
      </IonItem>
    </>
  );
}

export default SettingsInactivityThresholdItem;
