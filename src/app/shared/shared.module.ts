import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SummaryViewComponent } from './components/summary-view/summary-view.component';


@NgModule({
  declarations: [SummaryViewComponent],
  imports: [
    CommonModule,
    FullCalendarModule
  ],
  exports: [SummaryViewComponent]
})
export class SharedModule { }
