import { Component } from '@angular/core';
import { Platform, Events, App, ToastController, IonicApp } from 'ionic-angular';
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

    constructor(private toastCtrl: ToastController, app: App, public ionicApp: IonicApp, admobLib: AdMobService, public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public storage: Storage, public events: Events) {

        platform.ready().then(() => {
            // statusBar.styleDefault();
            admobLib.runAds();
            this.preloadData();
            var backbutton = 0;
            
            this.platform.registerBackButtonAction(() => {
                let nav = app.getActiveNav();
                let activePortal = this.ionicApp._loadingPortal.getActive() ||
                    this.ionicApp._modalPortal.getActive() ||
                    this.ionicApp._toastPortal.getActive() ||
                    this.ionicApp._overlayPortal.getActive();

                if (nav.canGoBack()) {
                    nav.pop();
                } else if (activePortal) {
                    activePortal.dismiss();
                }
                else{
                    if (backbutton == 0) {
                        backbutton += 1;
                        this.presentToast();
                        setTimeout(function () { backbutton = 0; }, 3000);
                    } else {
                        this.platform.exitApp();
                    }
                }              
                
            });
            
            splashScreen.hide();
        });

        events.subscribe('history:dates', (v) => {
            this.dates = v;
        });

        events.subscribe('request:expensesList', () => {
            // upon reaching expensesPage for the first time, fetch expensesList.
            events.publish('return:expensesList', this.expensesList);
        });

        events.subscribe('app:reload',() => {
            // in case of reset expenses before reaching expensesPage
            this.expensesList = [];
        });

        events.subscribe('reload:expenses', (v)=>{
            // in case of adding new expenses before reaching expensesPage
            if(v) this.expensesList = v;
        });

    }

    preloadData(){
        // preload data to solve expensesPage first time loading problem.
        this.storage.get('expensesList').then((expensesList) => {
            if(expensesList) this.expensesList = expensesList;
        });
    }

    presentToast() {
        let toast = this.toastCtrl.create({
            message: 'Press again to exit',
            duration: 2000,
            position: 'bottom'
        });

        toast.present();
    }
}
