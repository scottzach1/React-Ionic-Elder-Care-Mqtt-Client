import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {accessibilityOutline, batteryFullOutline, settingsOutline} from 'ionicons/icons';

import './services/MqttManager';
import './monitors/BatteryMonitor';
import './monitors/InactivityMonitor';
import SeniorTab from './pages/SeniorTab';
import BatteryTab from './pages/BatteryTab';
import SettingsTab from './pages/SettingsTab';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/senior" component={SeniorTab} exact={true}/>
          <Route path="/battery" component={BatteryTab} exact={true}/>
          <Route path="/settings" component={SettingsTab}/>
          <Route path="/" render={() => <Redirect to="/senior"/>} exact={true}/>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="senior" href="/senior">
            <IonIcon icon={accessibilityOutline}/>
            <IonLabel>Senior</IonLabel>
          </IonTabButton>
          <IonTabButton tab="battery" href="/battery">
            <IonIcon icon={batteryFullOutline}/>
            <IonLabel>Battery</IonLabel>
          </IonTabButton>
          <IonTabButton tab="settings" href="/settings">
            <IonIcon icon={settingsOutline}/>
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
