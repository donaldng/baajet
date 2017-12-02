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
    
    constructor(public platform: Platform, public admob: AdMobFree) {
        // platform.ready().then(() => {
        //     if (!this.paidVersion){
        //         this.runAds();
        //     }
        // });   
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
        if (this.paidVersion) return; 
        

        this.admob.interstitial.config(this.bannerConfig);
    
        this.admob.interstitial.prepare().then(() => {
            // this.admob.interstitial.show()
        }).catch(e => console.log(e));    
    }  
    
    runAds(){
        if (this.paidVersion) return; 

        this.admob.banner.config(this.bannerConfig);
        this.admob.banner.prepare().then(() => {
        }).catch(e => console.log(e));
                
    }
 
}
