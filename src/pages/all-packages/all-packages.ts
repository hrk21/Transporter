import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
  import { PackagedetailPage } from '../packagedetail/packagedetail';
import { Http, RequestOptions } from '@angular/http';
import { AlertController } from 'ionic-angular';
/**
 * Generated class for the AllPackagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-all-packages',
  templateUrl: 'all-packages.html',
})
export class AllPackagesPage {
  responseData = [];
  skips: number;


  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http,
    private alertCtrl: AlertController) {
    this.skips = 0;
    this.http.get('http://localhost:5000/allpackages?skips=' + this.skips).map(res => res.json()).subscribe(response => {

      for (let i = 0; i < response.content.length; i++) {
        this.responseData.push(response.content[i]);
      }
      console.log(this.responseData[0]);

    },
      err => {
        console.log('error');
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AllPackagesPage');
  }

  openPackageDetailsPage(i: any) {
    console.log(this.responseData[i]);
    this.navCtrl.push(PackagedetailPage, this.responseData[i]);
  }
  doInfinite(infiniteScroll){
    
    this.skips = this.skips + 1;
    var length = this.responseData.length;
      setTimeout(() => {
        this.http.get('http://localhost:5000/allpackages?skips=' + this.skips).map(res => res.json()).subscribe(response => {
          for (let i = 0; i < response.content.length; i++) {
            this.responseData.push(response.content[i]);
          }
          if (response.content == '') {
            console.log("End reached");
          }
        },
          err => {
            console.log('error');
          });
        // for (let i = 0; i < 30; i++) {
        //   this.items.push( this.items.length );
        // }
        if (length == this.responseData.length) {
          this.presentErrorAlert("There are no more packages left to show");
          infiniteScroll.enable(false);
        }
        console.log('Async operation has ended');
        infiniteScroll.complete();
      }, 300);
  }
  presentErrorAlert(text) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: text,
      buttons: ['Dismiss']
    });
    alert.present();
  }

}
