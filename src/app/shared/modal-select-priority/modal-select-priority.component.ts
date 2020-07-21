import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../alert.service';
import { PriorityService } from '../priority.service';
import { PrioritiesServicepointService } from '../priorities-servicepoint.service';

@Component({
  selector: 'app-modal-select-priority',
  templateUrl: './modal-select-priority.component.html',
  styles: []
})
export class ModalSelectPriorityComponent implements OnInit {

  @Input() patientName: string;

  @Output('onSelected') onSelected: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('content') public content: any;

  modalReference: NgbModalRef;
  priorities: any = [];

  constructor(
    private modalService: NgbModal,
    private alertService: AlertService,
    private priorityService: PriorityService,
    private prioritiesServicepointService: PrioritiesServicepointService
  ) { }

  ngOnInit() { }

  open(servicePointId = 0) {

    this.getList(servicePointId);

    this.modalReference = this.modalService.open(this.content, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      backdrop: 'static',
      // size: 'lg',
      centered: true
    });

    this.modalReference.result.then((result) => { });

  }

  dismiss() {
    this.modalReference.close();
  }

  async getList(servicePointId = 0) {
    try {
      let rs: any;
      rs = await this.priorityService.list();
      const data: any = await this.prioritiesServicepointService.listBySerivicePoint(servicePointId);
      console.log(data.results.length);
      if (data.results.length > 0) {
        const temp = [];
        data.results.forEach(v => {
          const proi = this.priorities.find(p => p.priority_id === v.priority_id);
          if (proi) {
            temp.push(proi);
          }
        });
        if (temp.length > 0) {
          rs.results = temp;
        }
      }
      if (rs.statusCode === 200) {
        this.priorities = rs.results;
      } else {
        this.alertService.error(rs.message);
      }
    } catch (error) {
      console.error(error);
      this.alertService.error('เกิดข้อผิดพลาด');
    }
  }

  async selected(priority: any) {
    if (priority) {
      try {
        this.onSelected.emit(priority);
        this.modalReference.close();
      } catch (error) {
        console.error(error);
        this.alertService.error('เกิดข้อผิดพลาด')
      }
    } else {
      this.alertService.error('กรุณาเลือกประเภทผู้ป่วย');
    }
  }

}
