import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { TabsPage } from '../pages/tabs/tabs';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = TabsPage;
    dates;
    expensesList;

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public storage: Storage, public events: Events) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            this.preloadData();
            splashScreen.hide();
        });

        events.subscribe('filter:dates', (v) => {
            this.dates = v.filter( function( item, index, inputArray ) {
                            return inputArray.indexOf(item) == index;
                        });;
        });

        events.subscribe('request:expensesList', () => {
            events.publish('return:expensesList', this.expensesList);
        });
    }

    preloadData(){
        this.storage.get('expensesList').then((expensesList) => {
            if(expensesList) this.expensesList = expensesList;
        });
    }
}
