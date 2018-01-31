import { Component } from '@angular/core';
import { NavParams, ViewController, ActionSheetController, MenuController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController, Platform, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Events } from 'ionic-angular';
import { ImageViewerController } from 'ionic-img-viewer';
import { ImageService } from '../../service/image';
import { AdMobService } from '../../service/admob';
import { DateService } from '../../service/date';

@Component({
    selector: 'page-manage',
    templateUrl: 'manage.html',
})

export class ManagePage {
    unchanged: any;
    expensesList: any[];
    expenses: any;
    pageName: string;
    selected_id: number;
    default_placeholder: string;
    freq: number;
    segmentVal: string = "onetime";
    tripStart;
    tripEnd;
    tmpImage: any;
    lastImage; // (?)
    thumbnail: string;
    saveimageFlag: boolean = false;
    editFlag: boolean = false;
    camOn: boolean = false;
    enablePhotoFlag: boolean;    
    todays_b: string;
    init_price: number;
    expenses_cat: string[];
    _imageViewerCtrl: ImageViewerController;
    imageList: any[];
    submitted: boolean;
    selected_tn: number;
    recur_text: string;
    segment: number;
    oriAmt: number;

    constructor(public dateLib: DateService, public menuCtrl: MenuController, public admobLib: AdMobService, public imgLib: ImageService, imageViewerCtrl: ImageViewerController, public actionSheetCtrl: ActionSheetController, public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController, private camera: Camera, public events: Events, public toastCtrl: ToastController, public platform: Platform) {
        this._imageViewerCtrl = imageViewerCtrl;
        this.enablePhotoFlag = false;
        this.submitted = false;
        this.selected_id = this.params.get('selected_id');
        this.expensesList = this.params.get('expensesList');
        this.camOn = this.params.get('camOn');
        this.segment = this.params.get('segment');
        this.init_price = this.params.get('init_price');
        if (this.camOn) this.captureImage();
        this.default_placeholder = 'Expenses #';
        this.recur_text = "Every days?";

        this.tmpImage = 0;

        this.set_todays_b();

        this.storage.get('duration').then((v) => {
            if (v){
                let duration = v.split(" ~ ");
                this.tripStart = duration[0];
                this.tripEnd = duration[1];
            }
            else{
                this.tripStart = this.dateLib.toString(new Date());
                let tripEnd = this.dateLib.addDay(new Date(), 6);
                this.tripEnd = this.dateLib.toString(tripEnd);
            }
            this.expenses.freq_start = this.tripStart;
            this.expenses.freq_end = this.tripEnd;            
        });

        if (this.selected_id == -1) { // New expenses
            this.expenses = {name: 'General', amount: '', freq: this.segment, freq_amt: "1" };
            if (this.init_price) this.expenses.amount = this.init_price;
            this.pageName = "Add Expenses";
            this.expenses.todays = true;
            this.expenses.fromReserved = 0;
        }
        else{ // Existing expenses
            let index = this.findIndex(this.selected_id);

            this.expenses = this.expensesList[index];
            this.tmpImage = this.expenses.image;
            this.pageName = "Manage Expenses";

            if (this.expenses.freq == 0){
                this.expenses.freq = 0;
                this.todays_b = this.expenses.freq_start.replace(" ", "T");
                let inputDate = new Date(this.todays_b);
                let todaysDate = new Date();
                this.expenses.todays = false;

                if(inputDate.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
                    this.expenses.todays = true;
                }
            }

            this.setFreq(this.expenses.freq);
            this.oriAmt = this.expenses.amount;

        }      

        this.storage.get('saveimageFlag').then((v) => {
            if(v) this.saveimageFlag = v;
        });    

        this.storage.get('editFlag').then((v) => {
            if(v) this.editFlag = v;
        });          

        this.storage.get('enablePhotoFlag').then((v) => {
            if(v) this.enablePhotoFlag = v;
            this.generateImageList(this.expenses.name);
            this.getSelectedTN();
        });   

        this.expenses_cat = ['General', 'Food', 'Transport', 'Shopping', 'Stay', 'Relax', 'Souvenir', 'Other'];        
        this.unchanged = JSON.parse(JSON.stringify(this.expensesList));
    }

    getSelectedTN(){
        this.selected_tn = 0;

        if(this.enablePhotoFlag && this.tmpImage != 0) this.selected_tn = 5;

        for(let i = 0; i < this.imageList.length ; i++){
            if(this.imageList[i].src == this.expenses.thumbnail){
                this.selected_tn = i;
                break;
            }
        }
    }

    updateRecurTxt(){
        this.recur_text = "Every " + this.expenses.freq_amt + " days?"
    }

    getThumbnailIndex(name: string, src: string){
        let list = this.imgLib.generateImageList(name);
        
        for (let i = 0; i < list.length; i++){
            if(list[i].src == src){
                return list[i].name;
            }
        }
        return 0;
    }

    openMenu() {
        this.menuCtrl.open();
    }

    findIndex(find_id: number): number{
        for (let i = 0, len = this.expensesList.length; i < len; i++) {
            if (this.expensesList[i].id == find_id){
                return i;
            }
        }
        return -1;
    }

    chooseImage(){
            let options = {
                sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: this.editFlag,
                destinationType: this.camera.DestinationType.DATA_URL
            };
            this.camera.getPicture(options).then((imagePath) => {              
                this.tmpImage = 'data:image/jpeg;base64,' + imagePath;
                this.generateImageList(this.expenses.name);
                this.selected_tn = 5;

            }, (err) => {
            });
    }

    captureImage(){
        const options: CameraOptions = {
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            saveToPhotoAlbum: this.saveimageFlag,
            allowEdit: this.editFlag,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.PNG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true
        }

        this.camera.getPicture(options).then((imageData) => {

            this.tmpImage = 'data:image/jpeg;base64,' + imageData;
            this.generateImageList(this.expenses.name);
            this.selected_tn = 5;
        }, (err) => {
            // Handle error
        });

    }

    set_todays_b(){
        let todays_b = this.dateLib.addDay(new Date(), 1);
        this.todays_b = this.dateLib.toString(todays_b);
    }
    
    submitForm() {
        let name = this.default_placeholder;

        if (this.expenses.name.trim() != "") name = this.expenses.name.trim();

        if (this.expenses.freq_start.trim() == "") this.expenses.freq_start = this.dateLib.toString(new Date()).replace('T',' ');
        if (this.expenses.freq_end.trim() == "") this.expenses.freq_end = this.dateLib.toString(new Date()).replace('T',' ');
        
        if (this.expenses.freq == 0){
            if(this.expenses.todays){
                this.expenses.freq_start = this.dateLib.toString(new Date()).replace('T',' ');
                this.expenses.freq_end = this.dateLib.toString(new Date()).replace('T',' ');
            }
            else{
                this.expenses.freq_start = this.todays_b.replace('T',' ');
                this.expenses.freq_end = this.todays_b.replace('T',' ');
            }
        }

        let image = 0;

        this.thumbnail = this.imageList[this.selected_tn].src;

        if(this.tmpImage && this.tmpImage!=0 && typeof this.tmpImage != 'undefined'){
            image = this.tmpImage;
        }

        // If expenses come from reserved, but later on changed value, it will no longer be considered as reserved status. 
        // Hence, treating it as a new day expenses.
        if(this.expenses.fromReserved && this.oriAmt != this.expenses.amount){
            this.expenses.fromReserved = 0;
        }

        let changes = {
            'id': this.expenses.id,
            'name':name,
            'amount': Number(this.expenses.amount),
            'freq': this.expenses.freq,
            'freq_amt': this.expenses.freq_amt,
            'freq_start': this.expenses.freq_start,
            'freq_end': this.expenses.freq_end,
            'datetime': this.expenses.datetime,
            'image': image,
            'thumbnail': this.thumbnail,
            'todays': this.expenses.todays,
            'fromReserved': this.expenses.fromReserved
        };

        if (this.expenses.freq_start > this.expenses.freq_end){
            alert('Why is the start date bigger than end date? :(');
        }
        else{
            if (this.selected_id == -1){
                changes['id'] = Math.round((new Date()).getTime() / 1000);
                changes['datetime'] = this.dateLib.toString(new Date()).replace('T',' ');
                if (this.expensesList)
                    this.expensesList.push(changes);
                else
                    this.expensesList = [changes];

                this.events.publish('change_segment', changes.freq);
            }
            else{
                let index = this.findIndex(this.selected_id);
                this.expensesList[index] = changes;
            }

            this.storage.set('expensesList', this.expensesList);
            this.events.publish('reload:expenses', this.expensesList);

            this.submitted = true;
            this.dismiss();    
        }          
    }
    
    deleteRecord(expenses){
        let index = this.expensesList.indexOf(expenses);
        this.expensesList.splice(index,1);
        this.storage.set('expensesList', this.expensesList);
        this.events.publish('reload:home','expensesList',this.expensesList);
        this.submitted = true;
        this.dismiss();
    }

    removeImage(){
        this.tmpImage = 0;
    }

    imageOptions(myImage){
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Action',
            buttons: [
            {
                text: 'View Photo',
                handler: () => {
                    const imageViewer = this._imageViewerCtrl.create(myImage);
                    imageViewer.present();                    
                }
            },
            {
                text: 'Remove Photo',
                handler: () => {
                    this.removeImage();
                    this.generateImageList(this.expenses.name);
                    this.selected_tn = 0;
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            }
            ]
        });

        actionSheet.present();
    }

    addMedia() {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Action',
            buttons: [
            {
                text: 'Take Photo',
                handler: () => {
                    this.captureImage();
                }
            },
            {
                text: 'Photo Gallery',
                handler: () => {
                    this.chooseImage();
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            }
            ]
        });

        actionSheet.present();
    }

    generateImageList(name: string){
        this.imageList = this.imgLib.generateImageList(name);

        if (this.enablePhotoFlag && this.tmpImage == 0){
            this.imageList[5].src = 'assets/imgs/icons/add-image.png';
            this.imageList[5].name = 'Add Media';
        }
        else if(this.enablePhotoFlag && this.tmpImage != 0){
            this.imageList[5].src = this.tmpImage;
            this.imageList[5].name = 'Photo';
        }
    }

    setFreq(freq: number): void{
        if (freq == 0) this.segmentVal = "onetime";
        if (freq == 1) this.segmentVal = "reserved";
        if (freq == 2) this.segmentVal = "recurring";

        this.expenses.freq = freq;
    }

    clickIcon(idx: number, thisImage){
        if (this.enablePhotoFlag && this.imageList[idx].name == 'Add Media'){
            this.addMedia();
        }
        else if(this.selected_tn==5 && this.imageList[idx].name == 'Photo'){
            this.imageOptions(thisImage);
        }
        else{
            this.selected_tn = idx;
        }
        
    }

    dismiss() {
        if (!this.submitted){
            this.events.publish('expenses:expensesList', this.unchanged);
        }
        //this.admobLib.showInterstitialAds(); // DO not show interstitial ads because banner overlap problem
        this.viewCtrl.dismiss(this.expensesList);
    }
}
