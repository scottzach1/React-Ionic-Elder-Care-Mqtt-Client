import React, {createContext, FC, useState} from "react";
import mqttHandler, {MqttHandler} from "../services/MqttHandler";

interface Props {
}

type MqttProviderType = MqttHandler;

export const MqttContext = createContext<MqttProviderType>(mqttHandler);

const MqttProvider: FC<Props> = (props) => {
  const [mqttService] = useState<MqttProviderType>(mqttHandler);

  return (
    <MqttContext.Provider value={mqttService}>
      {props.children}
    </MqttContext.Provider>
  );
}

export default MqttProvider;
