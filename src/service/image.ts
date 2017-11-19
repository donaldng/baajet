import { Injectable } from '@angular/core';

@Injectable()
export class ImageService {
    imageCat;

    constructor() {

        this.imageCat = {
            'general': [
                'cash','bigcash','credit_card','online_purchase','bitcoin','invoice'
            ],
            'food': [
                '','','','','',''
            ],
            'transport': [
                '','','','','',''
            ],
            'shopping': [
                '','','','','',''
            ],
            'stay': [
                '','','','','',''
            ],
            'relax': [
                '','','','','',''
            ],
            'souvenir': [
                '','','','','',''
            ],
            'other': [
                '','','','','',''
            ],
        };
    }

    getDefaultThumbnail(name, type){
        
        if(type==1 && name=="General") return "assets/imgs/icons/reserved.png";
        if(type > 1) return "assets/imgs/icons/recurring.png";

        if (name == "General") return "assets/imgs/icons/general.png";
        if (name == "Food") return "assets/imgs/icons/food.png";
        if (name == "Transport") return "assets/imgs/icons/transport.png";
        if (name == "Shopping") return "assets/imgs/icons/buy.png";
        if (name == "Stay") return "assets/imgs/icons/stay.png";
        if (name == "Relax") return "assets/imgs/icons/relax.png";
        if (name == "Souvenir") return "assets/imgs/icons/souvenir.png";
        if (name == "Other") return "assets/imgs/icons/other.png";
        
        return 0;
    }

    generateImageList(name){
        var imageList = [];
        var img_size = 1;
        name = name.toLowerCase();

        img_size = this.imageCat[name].length;

        /*
        for(var i = 0; i < img_size ; i++){
            imageList.push({src: "assets/imgs/icons/" + name + "/" + this.imageCat[name][i] + ".png"});
        }*/

        for(var i = 1; i < img_size + 1 ; i++){
            imageList.push({src: "assets/imgs/icons/" + name + "/" + name + "-" + i + ".png"});
        }        

        return imageList;
    }
}
