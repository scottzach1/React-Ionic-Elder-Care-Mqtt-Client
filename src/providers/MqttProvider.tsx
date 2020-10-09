import React, {createContext, FC, useState} from "react";
import {MqttHandler} from "../services/MqttHandler";

interface Props {
}

type MqttProviderType = MqttHandler | undefined;

export const MqttContext = createContext<MqttProviderType>(undefined);

const MqttProvider: FC<Props> = (props) => {
  const [mqttService] = useState<MqttProviderType>(new MqttHandler());

  return (
    <MqttContext.Provider value={mqttService}>
      {props.children}
    </MqttContext.Provider>
  );
}

export default MqttProvider;
