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
      if (rs.statusCode === 200) {
        this.priorities = await this.getPriorityByServicepoint(rs.results, servicePointId);
      } else {
        this.alertService.error(rs.message);
      }
    } catch (error) {
      console.error(error);
      this.alertService.error('เกิดข้อผิดพลาด');
    }
  }

  /**
   *  Get priorities by servicepoint id & replace priorities
   */

  async getPriorityByServicepoint(allPriorities = [], servicePointId = 0) {
    const data: any = await this.prioritiesServicepointService.listBySerivicePoint(servicePointId);
    if (data.results.length > 0) {
      const selected = [];
      data.results.forEach(v => {
        const proi = allPriorities.find(p => p.priority_id === v.priority_id);
        if (proi) { selected.push(proi); }
      });
      if (selected.length > 0) {
        allPriorities = selected;
      }
    }
    return allPriorities;
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
