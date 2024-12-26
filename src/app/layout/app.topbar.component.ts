import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { LayoutService } from "./service/app.layout.service";
import { AccountService } from "../services/account.service";
import { User } from "../models";

@Component({
  selector: "app-topbar",
  templateUrl: "./app.topbar.component.html",
})
export class AppTopBarComponent implements OnInit {
  user?: User | null;
  items!: MenuItem[];
  userMenu: MenuItem[] = [];
  logout() {
    this.accountService.logout();
  }
  @ViewChild("menubutton") menuButton!: ElementRef;

  @ViewChild("topbarmenubutton") topbarMenuButton!: ElementRef;

  @ViewChild("topbarmenu") menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private accountService: AccountService
  ) {
    
  }
  ngOnInit(): void {
    this.accountService.user.subscribe(x => this.user = x);
    this.user = this.accountService.userValue;
    this.userMenu = [
      {
        label: "Profile",
        items: [
          {
            label: this.user ? this.user.username : '',
            icon: "pi pi-user",
            command: () => {},
          },
          {
            label: "Logout",
            icon: "pi pi-power-off",
            command: () => {
              this.logout();
            },
          },
        ],
      },
    ];
  }

}
