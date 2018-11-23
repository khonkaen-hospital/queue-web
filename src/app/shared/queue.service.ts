import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  constructor(@Inject('API_URL') private apiUrl: string, private httpClient: HttpClient) { }

  async visitList(limit: number = 20, offset: number = 0) {
    const _url = `${this.apiUrl}/queue/his-visit?limit=${limit}&offset=${offset}`;
    return this.httpClient.get(_url).toPromise();
  }

  async changeRoom(queueId: any, roomId: any) {
    const _url = `${this.apiUrl}/queue/change-room`;
    return this.httpClient.post(_url, {
      roomId: roomId,
      queueId: queueId
    }).toPromise();
  }

  async getWaiting(servicePointId: any) {
    const _url = `${this.apiUrl}/queue/waiting/${servicePointId}`;
    return this.httpClient.get(_url).toPromise();
  }

  async getWorking(servicePointId: any) {
    const _url = `${this.apiUrl}/queue/working/${servicePointId}`;
    return this.httpClient.get(_url).toPromise();
  }

  async callQueue(servicePointId: any, queueNumber: any, roomId: any, queueId: any) {
    const _url = `${this.apiUrl}/queue/caller/${queueId}`;
    return this.httpClient.post(_url, {
      servicePointId: servicePointId,
      queueNumber: queueNumber,
      roomId: roomId
    }).toPromise();
  }

  async register(data: any) {
    const _url = `${this.apiUrl}/queue/register`;
    return this.httpClient.post(_url, {
      hn: data.hn,
      vn: data.vn,
      clinicCode: data.clinicCode,
      priorityId: data.priorityId,
      dateServ: data.dateServ,
      timeServ: data.timeServ,
      hisQueue: data.hisQueue,
      firstName: data.firstName,
      lastName: data.lastName,
      title: data.title,
      birthDate: data.birthDate,
      sex: data.sex,
    }).toPromise();
  }

}
