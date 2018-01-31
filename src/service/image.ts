import { Injectable } from '@angular/core';

@Injectable()
export class ImageService {

    constructor() {

    }
    getCategory(){
        let imageCat = {
            'general': [
                'food', 'taxi', 'shopping', 'ticket', 'groceries', 'dollar'
            ],
            'food': [
                'rice', 'noodle', 'salad', 'pizza', 'dessert', 'breads'
            ],
            'transport': [
                'bus', 'scooter', 'train', 'airplane', 'cruise', 'bike'
            ],
            'shopping': [
                'cloth', 'bag', 'shoes', 'assesories', 'luxuries', 'watch'
            ],
            'stay': [
                'house', 'apartment', 'city', 'camp', 'cabin', 'castle'
            ],
            'relax': [
                'coffee', 'beer', 'bar', 'theater', 'karaoke', 'disco'
            ],
            'souvenir': [
                'typical', 'toy', 'doll', 'assesories', 'gift', 'package'
            ],
            'other': [
                'cash', 'cash_bag', 'credit_card', 'online', 'bitcoin', 'invoice'
            ],
        };
        return imageCat;
    }
    getDefaultThumbnail(name: string, type: number){
        
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

    generateImageList(name: string){
        let imageList = [];
        let img_size = 1;
        name = name.toLowerCase();

        let category = this.getCategory();
        img_size = category[name].length;

        
        for(let i = 0; i < img_size ; i++){
            let img_name = this.capitalizeFirstLetter(category[name][i].replace('_', ' '));

            imageList.push({
                name: img_name,
                src: "assets/imgs/icons/" + name + "/" + category[name][i] + ".png"
            });
        }

        return imageList;
    }

    capitalizeFirstLetter(str: string) {
       return str.charAt(0).toUpperCase() + str.slice(1);
    }
 
}
