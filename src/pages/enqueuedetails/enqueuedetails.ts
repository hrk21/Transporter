import { EnqueuePage } from './../enqueue/enqueue';
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform, AlertController, Nav, Loading } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
declare var google: any;
/**
 * Generated class for the EnqueuedetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-enqueuedetails',
  templateUrl: 'enqueuedetails.html',
})
export class EnqueuedetailsPage {

  item: any;
  Source: any;
  map: any;
  Destination: any;
  ID: any;
  token: any;
  loading: Loading;
  cancellationOption: Boolean;
  inProgress: Boolean;
  cancelledPackage: Boolean;
  observer: any
  marker1: any;
  myPosition: any
  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation,
    public zone: NgZone, public loadingCtrl: LoadingController, public platform: Platform, public http: Http,
    private alertCtrl: AlertController, public storage: Storage) {
    this.cancelledPackage = false;//the packages has been not cancelled hence set to false
    this.item = this.navParams.data;//get the package data from navParameters
    console.log(this.item.Status);
    if (this.item.Status == "Awaiting") {//check the package status if awaiting means the packages is to be picked up from source point
      this.inProgress = false;//pacakges is yet to be picked up from source point
      this.cancellationOption = true;//cancellation option is available
    }
    else {
      this.inProgress = true;//the status in enroute and the delivery is in progress
      this.cancellationOption = false;//the package cannot be cancelled
    }
    this.setData().then(() => {
      this.createMap();//initialise map
      this.findPath();// find the path from user to current destination(source or destination)
      /* An observable is created below which runs after ever 3 seconds and checks if the current postion of the user
      has changes of not based on that it refreshes the map*/
      this.observer = Observable.interval(3000).subscribe(() => {//update timer to 20 seconds
        this.geolocation.getCurrentPosition().then(
          (position) => {
            //console.log("ALoha" + position.coords.latitude, position.coords.longitude);
            let newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);//get current position
            if (this.myPosition != newPosition) {//positon has changed
              if (this.marker1 != null) {//if marker has been set once before
                this.marker1.setMap(null)//remove marker for current location
              }
              this.marker1 = new google.maps.Marker({//drop new marker at current location
                map: this.map,
                position: this.myPosition,
                draggable: false,
              });
            }
          }),
          (error) => {
            console.log(error);//show error if any with geolocation
          }
      });
    })
  }
  setData(): Promise<any> {//data is to be set in local variables before they are referenced
    return new Promise((resolve, reject) => {//return a new promise
      this.Source = new google.maps.LatLng(this.item.SourceLatitude, this.item.SourceLongitude);//set local source variable
      console.log(this.Source)
      this.Destination = new google.maps.LatLng(this.item.DestinationLatitude, this.item.DestinationLongitude);//set locatl destionation variable
      console.log(this.Destination);
      setTimeout(() => {//wait 1 seconds for google to return the response and set local varaibles
        console.log("yolo");
        resolve();//resolve the promise
      }, 1000);//wait just in case
    })
  }
  createMap(){//create a new map
    this.map = new google.maps.Map(document.getElementById('mapdetail'), {
      zoom: 12,
      center: this.Source
    });
  }

  findPath() {//method to show user path to current destination(can be source or destination of packge)
    let directionsService = new google.maps.DirectionsService;
    var rendererOptions = {
      preserveViewport: true//stop from zoom adjustment when the path is drawn
    };
    let directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);//direction display object
    directionsDisplay.setMap(this.map);//remove current directions shown
    console.log("outprogresso");
    this.geolocation.getCurrentPosition().then(
      (position) => {
        console.log("ALoha" + position.coords.latitude, position.coords.longitude);
        this.myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        if (this.inProgress) {//if the package is enroute and the destination is package destination
          console.log("inprogresso");
          directionsService.route({
            origin: this.myPosition,
            destination: this.Destination,
            travelMode: 'DRIVING'
          }, function (response, status) {
            if (status === 'OK') {
              // for (var i = 0; i < response.routes.length; i++) {
              //   directionsDisplay.setDirections(response);
              //   // Tell the DirectionsRenderer which route to display
              //   directionsDisplay.setRouteIndex(i);
              //   //directionsDisplay.setMap(this.map);
              //   console.log(response.routes[i].legs[0].distance.value / 1000);
              //}
              console.log(response.routes[0].legs[0].distance.value / 1000);
              directionsDisplay.setDirections(response);//draw directions
            } else {
              window.alert('Directions request failed due to ' + status);//error show
            }
          });
        }
        else {//if package is yet to picked up destination is package source
          console.log("noint progresso");
          directionsService.route({
            origin: this.myPosition,
            destination: this.Source,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            provideRouteAlternatives: true
          }, function (response, status) {
            if (status === 'OK') {
              // for (var i = 0; i < response.routes.length; i++) {
              //   var dr = new google.maps.DirectionsRenderer();
              //   directionsDisplay.setDirections(response);
              //   // Tell the DirectionsRenderer which route to display
              //   directionsDisplay.setRouteIndex(i);
              //   //directionsDisplay.setMap(this.map);
              //   console.log(response.routes[i].legs[0].distance.value / 1000);
              //  }
              console.log(response.routes[0].legs[0].distance.value / 1000);
              directionsDisplay.setDirections(response);//draw directions
            } else {
              window.alert('Directions request failed due to ' + status);//show error
            }
          });
        }
      }),
      (error) => {
        console.log(error);//show any error with geolocation
      }


  }
  confirmPickUp(PackageID) {//congfirm that the package has been picked up
    let alert = this.alertCtrl.create({//create a prompt to confirm that the user has pciked up the package this is to avoid missclicks
      title: 'Confirm PickUp',
      message: 'You have picked up the package?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            //in case of no do nothing and remove prompt
          }
        },
        {
          text: 'Confirm',
          handler: () => {

            let loading = this.loadingCtrl.create({
              content: 'Waiting for server response...',
            });
            loading.present();//present notification to show user that request is bieng processed
            this.storage.get('ID').then((val) => {
              this.ID = val;
              let requestData = {//data to be sent in the request
                'PackageID': PackageID,//the package id 
                'TransporterID': this.ID,//the user id of the transporter
              };
              /*put request send to update package status from awaiting to intransit*/
              this.http.put('http://localhost:5000/confirmPickUp', JSON.stringify(requestData)).map(res => res.json()).subscribe(response => {
                if (response['status'] == 'success') {
                  loading.dismiss();
                  this.presentNotification("Pick Up confirmed", "picked up");
                  this.inProgress = true;//in progress set to true shows the input field to enter key and verify the PIN
                  this.cancellationOption = false;//cancell package button is now hidden from view
                  this.createMap();
                  this.findPath();//new route from the user to the destination instead of the source of the package
                }
                else {
                  loading.dismiss();
                  this.presentNotification("testing", "Failed");// if the request has failed
                }
              },
                err => {
                  console.log('error');
                  console.log(err);//show any error with http request
                });
            });
          }
        }
      ]
    });
    alert.present();//present the alert created above to the user
  }

  sendDelivertConfirmation(PackageID) {//confirmation of delivery
    let loading = this.loadingCtrl.create({//loading to show the request is being processed
      content: 'Waiting for Verification Key validation...',
    });

    loading.present();//present the loading
    if (/^\d{8}$/.test(this.token)) {//Regex check that the value entered only consist of 10 digits
      // setTimeout(() => {
      //   this.storage.get('ID').then((val) => {
      //     this.ID = val;
      //     let Userdata = {
      //       'ID': this.ID,
      //       'token': this.token,
      //       //'Token':this.Token,
      //     };
      /*update package status to completed */
      this.http.get('http://localhost:5000/deliveryCompleted', { params: { 'PackageID': PackageID, 'token': this.token } }
      ).map(res => res.json()).subscribe(response => {
        if (response.content == 'success') {
          loading.dismiss();
          this.presentNotification("The Package delivery is completed", "Success");//tell the user that delivery has been completed
          setTimeout(() => {
            this.navCtrl.setRoot(EnqueuePage);//reroute to previous page
          }, 400);
        }
        else {
          loading.dismiss();
          this.presentNotification("Verification Key Mismatch", "Failed");//wrong token was entered
        }
      },
        err => {
          console.log('error');
        });
      //   });
      // }, 300);
    }
    else {
      loading.dismiss();
      this.presentNotification("Verification Key consists of only 8 digits", "Re Check Token")
    }
  }
  cancelPackage(PackageID) {//method to cancel the package
    let loading = this.loadingCtrl.create({
      content: 'Waiting for Verification Key validation...',
    });
    //loading.present();
    this.cancelledPackage = true;
    this.cancellationOption = false;
    // setTimeout(() => {
    this.storage.get('ID').then((val) => {
      this.ID = val;
      let requestData = {//data to be sent along with the request
        'PackageID': PackageID,
        'TransporterID': this.ID,
      };
      this.http.put('http://localhost:5000/cancelPackage', JSON.stringify(requestData)).map(res => res.json()).subscribe(response => {
        if (response['status'] == 'success') {
          loading.dismiss();
          this.presentNotification("Package Cancelled", "Cancelled");//tell the user that the package has been cancelled
          setTimeout(() => {
            this.navCtrl.setRoot(EnqueuePage);//reroute to previous page
          }, 400);

        }
        else {
          loading.dismiss();
          this.presentNotification("testing", "Failed");//tell the user the request has been denied
        }
      },
        err => {
          console.log('error');
        });
    });
    // }, 300);
  }


  ionViewWillLeave() {
    console.log("Looks like I'm about to leave :(");
    this.observer.unsubscribe();//unsubsribe to geolocation tracking
  }

  presentNotification(text, header) {//notification creation method
    let alert = this.alertCtrl.create({
      title: header,
      subTitle: text,
      buttons: ['Dismiss']
    });
    alert.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad EnqueuedetailsPage');
  }

}
 // findPath() {

  //   this.map = new google.maps.Map(document.getElementById('mapdetail'), {
  //     zoom: 7,
  //     center: { lat: 31.4826352, lng: 74.0712721 }
  //   });

  //   this.observer = Observable.interval(5000).subscribe(() => {//update timer to 20 seconds
  //     this.geolocation.getCurrentPosition().then(
  //       (position) => {
  //         console.log(position.coords.latitude, position.coords.longitude);
  //         let myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  //         console.log(JSON.parse(JSON.stringify(myPosition)));
  //         let directionsService = new google.maps.DirectionsService;
  //         let directionsDisplay = new google.maps.DirectionsRenderer;
  //         if (this.marker1 != null && this.marker2 != null) {
  //           this.marker1.setMap(null)
  //           this.marker2.setMap(null)
  //           console.log("hello");
  //         }
  //         directionsDisplay.setMap(this.map);
  //         directionsService.route({
  //           origin: myPosition,
  //           destination: this.Destination,
  //           travelMode: 'DRIVING'
  //         }, function (response, status) {
  //           if (status === 'OK') {
  //             directionsDisplay.setDirections(response);
  //           } else {
  //             window.alert('Directions request failed due to ' + status);
  //           }
  //         });
  //       }),
  //       (error) => {
  //         console.log(error);
  //       }
  //   });

  // }