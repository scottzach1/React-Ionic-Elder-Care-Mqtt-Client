import React, {createContext, FC, useState} from "react";
import {MqttService} from "../services/MqttService";

interface Props {
}

type MqttProviderType = MqttService | undefined;

export const MqttContext = createContext<MqttProviderType>(undefined);

const MqttProvider: FC<Props> = (props) => {
  const [mqttService] = useState<MqttProviderType>(new MqttService());

  return (
    <MqttContext.Provider value={mqttService}>
      {props.children}
    </MqttContext.Provider>
  );
}

export default MqttProvider;
