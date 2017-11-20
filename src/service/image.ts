import { Injectable } from '@angular/core';

@Injectable()
export class ImageService {
    imageCat;

    constructor() {

        this.imageCat = {
            'general': [
                'dollar','bigcash','credit_card','online_purchase','bitcoin','invoice'
            ],
            'food': [
                'rice','noodle','meat','salad','pizza','breads'
            ],
            'transport': [
                'scooter','taxi','bus','train','airplane','cruise'
            ],
            'shopping': [
                'cloth','bag','shoes','watch','assesories','luxuries'
            ],
            'stay': [
                'house','apartment','city','camp','cabin','castle'
            ],
            'relax': [
                'coffee','beer','bar','theater','karaoke','disco'
            ],
            'souvenir': [
                'typical','toy','doll','assesories','gift','package'
            ],
            'other': [
                'cash','cash_bag','credit_card','online','bitcoin','invoice'
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

        
        for(var i = 0; i < img_size ; i++){
            var img_name = this.capitalizeFirstLetter(this.imageCat[name][i].replace('_', ' '));

            imageList.push({
                name: img_name,
                src: "assets/imgs/icons/" + name + "/" + this.imageCat[name][i] + ".png"
            });
        }

        return imageList;
    }

    capitalizeFirstLetter(string) {
       return string.charAt(0).toUpperCase() + string.slice(1);
    }
 
}
