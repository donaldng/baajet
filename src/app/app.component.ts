import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { TabsPage } from '../pages/tabs/tabs';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = TabsPage;
    dates;
    expensesList;
    paidVersion:boolean = false;

    constructor(public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public storage: Storage, public admob: AdMobFree, public events: Events) {

        platform.ready().then(() => {
            // statusBar.styleDefault();
            if (!this.paidVersion) this.runAds();
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

    }

    runAds(){
        let adId;
        if(this.platform.is('android')) {
            adId = 'ca-app-pub-8912779457218327~4932552355';
        } else if (this.platform.is('ios')) {
            adId = 'ca-app-pub-8912779457218327/6232836365';
        }
        
        let bannerConfig: AdMobFreeBannerConfig = {
            isTesting: true,
            autoShow: true,
            id: adId
        };

        this.admob.banner.config(bannerConfig);

        this.admob.banner.prepare().then(() => {
        }).catch(e => console.log(e));
                
    }

    preloadData(){
        this.storage.get('expensesList').then((expensesList) => {
            if(expensesList) this.expensesList = expensesList;
        });
    }
}
