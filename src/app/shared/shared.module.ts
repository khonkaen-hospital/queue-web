import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAddServicePointComponent } from './modal-add-service-point/modal-add-service-point.component';
import { ServicePointService } from './service-point.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ModalAddUserComponent } from './modal-add-user/modal-add-user.component';
import { AuthGuardService } from './auth-guard.service';
import { LoginService } from './login.service';
import { ModalRoomsComponent } from './modal-rooms/modal-rooms.component';
import { ServiceRoomService } from './service-room.service';
import { PriorityService } from './priority.service';
import { QueueService } from './queue.service';
import { ModalSelectServicepointsComponent } from './modal-select-servicepoints/modal-select-servicepoints.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule
  ],
  declarations: [ModalAddServicePointComponent, ModalAddUserComponent, ModalRoomsComponent, ModalSelectServicepointsComponent],
  exports: [ModalAddServicePointComponent, ModalAddUserComponent, ModalRoomsComponent, ModalSelectServicepointsComponent],
  providers: [ServicePointService, ServiceRoomService, PriorityService, QueueService, AuthGuardService, LoginService]
})
export class SharedModule { }
