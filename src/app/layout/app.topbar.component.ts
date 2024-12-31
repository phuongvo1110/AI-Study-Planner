import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { LayoutService } from "./service/app.layout.service";
import { AccountService } from "../services/account.service";
import { User } from "../models";
import { Router } from "@angular/router";

@Component({
  selector: "app-topbar",
  templateUrl: "./app.topbar.component.html",
})
export class AppTopBarComponent implements OnInit {
  user?: User | null;
  items!: MenuItem[];
  userMenu: MenuItem[] = [];

  @ViewChild("menubutton") menuButton!: ElementRef;
  @ViewChild("topbarmenubutton") topbarMenuButton!: ElementRef;
  @ViewChild("topbarmenu") menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private accountService: AccountService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to the user BehaviorSubject to react to changes in the user state
    this.accountService.user.subscribe((user) => {
      this.user = user;
      this.updateUserMenu();
      this.changeDetector.detectChanges(); // Ensure the view is updated
    });

    // Initialize the user menu based on the current user state
    this.user = this.accountService.userValue;
    this.updateUserMenu();
  }

  logout() {
    this.accountService.logout();
  }

  // Dynamically update the user menu when the user changes
  private updateUserMenu(): void {
    this.userMenu = [
      {
        label: "Profile",
        items: [
          {
            label: this.user ? this.user.username : "Guest",
            icon: "pi pi-user",
            command: () => {
              this.router.navigate(["/profile"]);
            },
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
