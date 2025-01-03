import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary-view',
  templateUrl: './summary-view.component.html',
  styleUrl: './summary-view.component.scss'
})
export class SummaryViewComponent {
  @Input({required: true}) icon: string;
  @Input() label: string;
  @Input() value: any;
}
