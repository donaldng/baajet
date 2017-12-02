import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';

@Injectable()
export class AdMobService {
    paidVersion:boolean = false;
    bannerConfig: AdMobFreeBannerConfig = {
        id: this.AdsId(),
        isTesting: true,
        autoShow: true
    };
    counter; // spam prevention
    
    constructor(public platform: Platform, public admob: AdMobFree) {
        this.counter = 0;
    }

    AdsId(){
        let adId;
        if(this.platform.is('android')) {
            adId = 'ca-app-pub-8912779457218327~4932552355';
        } else if (this.platform.is('ios')) {
            adId = 'ca-app-pub-8912779457218327/6232836365';
        }
        return adId;
    }

    showInterstitialAds(){
        this.counter += 1;
        var chance = Math.round(Math.random()); // 50% chance of showing
        if (!this.paidVersion && this.counter >= 3 && chance <= 0.5){
            this.admob.interstitial.config(this.bannerConfig);
            
            this.admob.interstitial.prepare().then(() => {
                this.counter = 0;
                // this.admob.interstitial.show()
                this.runAds();
            }).catch(e => console.log(e));    
        }
    }  
    
    runAds(){
        if (this.paidVersion) return; 

        this.admob.banner.config(this.bannerConfig);
        this.admob.banner.prepare().then(() => {
        }).catch(e => console.log(e));
                
    }
 
}
