import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../pages/tabs/tabs';
import { AdMobService } from '../service/admob';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = TabsPage;
    dates;
    expensesList;

    constructor(admobLib: AdMobService, public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public storage: Storage, public events: Events) {

        platform.ready().then(() => {
            // statusBar.styleDefault();
            admobLib.runAds();
            this.preloadData();
            splashScreen.hide();
        });

        events.subscribe('history:dates', (v) => {
            this.dates = v;
        });

        events.subscribe('request:expensesList', () => {
            events.publish('return:expensesList', this.expensesList);
        });

        events.subscribe('app:reload',() => {
            // preload again in case of reset
            this.expensesList = [];
        });

        events.subscribe('reload:expenses', (v)=>{
            if(v) this.expensesList = v;
        });

    }

    preloadData(){
        this.storage.get('expensesList').then((expensesList) => {
            if(expensesList) this.expensesList = expensesList;
        });
    }
}
