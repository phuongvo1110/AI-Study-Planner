import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Workspace', icon: 'pi pi-fw pi-calendar', routerLink: ['/workspace'] },
                    { label: 'Tasks', icon: 'pi pi-fw pi-book', routerLink: ['/tasks'] },
                    { label: 'Analytics', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/analytics'] },
                ]
            },
        ];
    }
}
