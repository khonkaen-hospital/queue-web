import { KioskService } from './../../shared/kiosk.service';
import { AlertService } from 'src/app/shared/alert.service';
import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ActivatedRoute, Router } from '@angular/router';
import * as mqttClient from '../../../vendor/mqtt';
import { MqttClient } from 'mqtt';
import * as Random from 'random-js';
import { CountdownComponent } from 'ngx-countdown';
import * as moment from 'moment';
@Component({
  selector: 'app-sso',
  templateUrl: './sso.component.html',
  styleUrls: ['./sso.component.css']
})
export class SsoComponent implements OnInit {

  jwtHelper = new JwtHelperService();
  hn: any;
  tabServicePoint = false;
  btnSelectServicePoint = false;
  tabProfile = true;
  servicePointList = [];
  token: any;
  hospname: any;
  isOffline = false;
  client: MqttClient;
  notifyUser = null;
  notifyPassword = null;
  notifyUrl: string;
  kioskId: any;
  isPrinting = false;

  cardCid: any;
  cardCidShow: any;
  cardFullName: any;
  cardBirthDate: any;
  his: any;
  hisHn: any;
  hisFullName: any;
  hisBirthDate: any;

  rightName: any;
  rightStartDate: any;
  rightHospital: any;
  isSendAPIGET: any;
  isSendAPIPOST: any;
  urlSendAPIGET: any;
  urlSendAPIPOST: any;
  loading: boolean = false;


  @ViewChild(CountdownComponent) counter: CountdownComponent;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private kioskService: KioskService,
    private zone: NgZone,
    private router: Router) {
    this.route.queryParams
      .subscribe(params => {
        this.token = params.token || null;
      });
  }

  ngOnInit() {
    try {
      this.token = this.token || sessionStorage.getItem('token');
      if (this.token) {
        const decodedToken = this.jwtHelper.decodeToken(this.token);
        this.notifyUrl = `ws://${decodedToken.NOTIFY_SERVER}:${+decodedToken.NOTIFY_PORT}`;
        this.notifyUser = decodedToken.NOTIFY_USER;
        this.notifyPassword = decodedToken.NOTIFY_PASSWORD;
        this.kioskId = localStorage.getItem('kioskId') || '1';
        this.urlSendAPIGET = localStorage.getItem('urlSendVisitGet') ? localStorage.getItem('urlSendVisitGet') : null;
        this.urlSendAPIPOST = localStorage.getItem('urlSendVisitPost') ? localStorage.getItem('urlSendVisitPost') : null;
        this.isSendAPIGET = localStorage.getItem('isSendAPIGET') === 'Y' ? true : false;
        this.isSendAPIPOST = localStorage.getItem('isSendAPIPOST') === 'Y' ? true : false;
        this.initialSocket();
        console.log(this.notifyUrl);
      } else {
        this.alertService.error('ไม่พบ TOKEN');
      }

    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }
  async initialSocket() {
    // connect mqtt
    await this.connectWebSocket();
    await this.getInfoHospital();
    await this.getServicePoint();
  }

  connectWebSocket() {
    const rnd = new Random();
    const username = sessionStorage.getItem('username');
    const strRnd = rnd.integer(1111111111, 9999999999);
    const clientId = `${username}-${strRnd}`;

    try {
      this.client = mqttClient.connect(this.notifyUrl, {
        clientId: clientId,
        username: this.notifyUser,
        password: this.notifyPassword
      });
    } catch (error) {
      console.log(error);
    }

    const topic = `kiosk/${this.kioskId}`;

    const that = this;

    this.client.on('message', async (topic, payload) => {
      try {
        const _payload = JSON.parse(payload.toString());
        if (_payload.ok) {
          await this.setDataFromCard(_payload.results);
        } else {
          this.clearData();
        }
      } catch (error) {
        console.log(error);
      }

    });

    this.client.on('connect', () => {
      console.log(`Connected!`);
      that.zone.run(() => {
        that.isOffline = false;
      });

      that.client.subscribe(topic, { qos: 0 }, (error) => {

        if (error) {
          that.zone.run(() => {
            that.isOffline = true;
            try {
              that.counter.restart();
            } catch (error) {
              console.log(error);
            }
          });
        } else {
          console.log(`subscribe ${topic}`);
        }
      });


    });

    this.client.on('close', () => {
      console.log('MQTT Conection Close');
    });

    this.client.on('error', (error) => {
      console.log('MQTT Error');
      that.zone.run(() => {
        that.isOffline = true;
        that.counter.restart();
      });
    });

    this.client.on('offline', () => {
      console.log('MQTT Offline');
      that.zone.run(() => {
        that.isOffline = true;
        try {
          that.counter.restart();
        } catch (error) {
          console.log(error);
        }
      });
    });
  }

  async getInfoHospital() {
    try {
      const rs: any = await this.kioskService.getInfo(this.token);
      this.hospname = rs.info.hosname;
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async getServicePoint() {
    try {
      const rs: any = await this.kioskService.getServicePoint(this.token);
      if (rs.statusCode === 200) {
        this.servicePointList = rs.results;
      }
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async getPatient() {
    try {
      if (this.cardCid) {
        const rs: any = await this.kioskService.getPatient(this.token, { 'cid': this.cardCid });
        if (rs.statusCode === 200) {
          this.setDataFromHIS(rs.results);
        }
      }
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }


  onSelectServicePointList() {
    this.tabServicePoint = true;
    this.tabProfile = false;
  }

  cancel() {
    this.btnSelectServicePoint = true;
    this.tabServicePoint = false;
    this.tabProfile = true;
  }

  async setDataFromCard(data) {
    console.log(data);
    this.cardCid = data.cid;
    this.cardCidShow = data.cid.slice(0, data.cid.length - 4) + data.cid.slice(data.cid.length - 4, data.cid.length).replace(/[0-9]/g, "*");
    this.cardFullName = data.fullname;
    this.cardBirthDate = data.birthDate;
    if (this.cardCid) {
      await this.getPatient();
      await this.getNhso(this.cardCid, data);

    } else {
      this.alertService.error('บัตรมีปัญหา กรุณาเสียบใหม่อีกครั้ง', null, 1000);
    }

  }

  async setDataFromHIS(data) {
    this.his = data;
    this.hisHn = data.hn;
    this.hisFullName = `${data.title}${data.firstName} ${data.lastName}`;
    this.hisBirthDate = data.birthDate;
    if (this.his) {
      await this.setTab();
    }
  }

  setTab() {
    if (+this.servicePointList.length <= 3) {
      this.btnSelectServicePoint = false;
      this.tabServicePoint = true;
    } else {
      this.btnSelectServicePoint = true;
    }
  }

  clearData() {
    this.cardCid = '';
    this.cardCidShow = '';
    this.cardFullName = '';
    this.cardBirthDate = '';

    this.hisBirthDate = '';
    this.hisFullName = '';
    this.hisHn = '';

    this.rightName = '';
    this.rightStartDate = '';
    this.rightHospital = '';

    this.tabProfile = true;
    this.btnSelectServicePoint = false;
    this.tabServicePoint = false;
  }

  print() {
    const printerId = localStorage.getItem('clientPrinterId');
    const TOPIC = `/printer/${printerId}`;
    this.client.publish(TOPIC, JSON.stringify({
      'singleSlipSso': 1,
      'slipSso': 0,
      'fullName': this.cardFullName,
      'hn': this.hisHn,
      'hosname': this.hospname,
      'rightName': this.rightName,
      'rightHospital': this.rightHospital,
      'rightStartDate': this.rightStartDate
    }));
    console.log('print:', TOPIC);
  }

  async register(servicePoint) {
    this.isPrinting = true;
    const priorityId = localStorage.getItem('kiosDefaultPriority') || '1';
    const data = {
      hn: this.his.hn,
      vn: 'K' + moment().format('x'),
      clinicCode: servicePoint.local_code,
      priorityId: priorityId,
      dateServ: moment().format('YYYY-MM-DD'),
      timeServ: moment().format('HHmm'),
      hisQueue: '',
      firstName: this.his.firstName,
      lastName: this.his.lastName,
      title: this.his.title,
      birthDate: this.his.engBirthDate,
      sex: this.his.sex
    };
    try {

      const rs: any = await this.kioskService.register(this.token, data);
      if (rs.statusCode === 200) {
        if (rs.queueId) {
          await this.print();
          if (this.isSendAPIGET) {
            await this.kioskService.sendAPITRIGGER(this.token, 'GET', this.urlSendAPIGET, this.his.hn, this.cardCid, servicePoint.local_code, servicePoint.service_point_id);
          }
          if (this.isSendAPIPOST) {
            await this.kioskService.sendAPITRIGGER(this.token, 'POST', this.urlSendAPIPOST, this.his.hn, this.cardCid, servicePoint.local_code, servicePoint.service_point_id);
          }
        }
      } else {
        this.alertService.error('ไม่สามารถลงทะเบียนได้');
        this.isPrinting = false;
      }
    } catch (error) {
      this.isPrinting = false;
      console.log(error);
    }
  }

  async getNhso(cid, person) {

    this.loading = true;
    const nhsoToken = localStorage.getItem('nhsoToken');
    const nhsoCid = localStorage.getItem('nhsoCid');
    const data = `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tok=\"http://tokenws.ucws.nhso.go.th/\">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <tok:searchCurrentByPID>\n         <!--Optional:-->\n         <user_person_id>${nhsoCid}</user_person_id>\n         <!--Optional:-->\n         <smctoken>${nhsoToken}</smctoken>\n         <!--Optional:-->\n         <person_id>${cid}</person_id>\n      </tok:searchCurrentByPID>\n   </soapenv:Body>\n</soapenv:Envelope>`;
    try {
      const nhso: any = {};
      const rs: any = await this.kioskService.getNhso(this.token, { data: data, person: person });
      rs.results.forEach(v => {
        if (v.name === 'hmain') { nhso.hmain = v.elements[0].text; }
        if (v.name === 'hmain_name') { nhso.hmain_name = v.elements[0].text; }
        if (v.name === 'maininscl') { nhso.maininscl = v.elements[0].text; }
        if (v.name === 'maininscl_main') { nhso.maininscl_main = v.elements[0].text; }
        if (v.name === 'maininscl_name') { nhso.maininscl_name = v.elements[0].text; }
        if (v.name === 'startdate') { nhso.startdate = v.elements[0].text; }
        if (v.name === 'startdate_sss') { nhso.startdate_sss = v.elements[0].text; }
      });
      this.rightName = nhso.maininscl ? `${nhso.maininscl_name} (${nhso.maininscl})` : '-';
      this.rightHospital = nhso.hmain ? `${nhso.hmain_name} (${nhso.hmain})` : '-';
      this.rightStartDate = nhso.startdate ? `${moment(nhso.startdate, 'YYYYMMDD').locale('th').format('DD MMM ')} ${moment(nhso.startdate, 'YYYYMMDD').locale('th').get('year')}` : '-';
      this.loading = false;
      this.print();
    } catch (error) {
      console.log(error);
      // this.alertService.error(error.message);
    }
  }

  home() {
    this.router.navigate(['/admin/setting-kiosk']);

  }

}
