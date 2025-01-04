import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MenuItem, MessageService } from "primeng/api";
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
  createUserModal: boolean = false;
  userForm: any = {
    email: '',
    password: '',
  }
  submittedUser: boolean = false;
  @ViewChild("menubutton") menuButton!: ElementRef;
  @ViewChild("topbarmenubutton") topbarMenuButton!: ElementRef;
  @ViewChild("topbarmenu") menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private accountService: AccountService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private messageService: MessageService
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
    console.log(this.user);
    this.updateUserMenu();
  }

  logout() {
    this.accountService.logout();
  }
  hideUserDialog() {
    this.createUserModal = false;
    this.submittedUser = false;
  }
  saveUser() {
    this.submittedUser = true;
    this.accountService.upgradeMember(this.userForm.email, this.userForm.password).pipe().subscribe({
      next: (response: any) => {
        console.log(response);
        this.showSuccessMessage("User upgraded successfully");
        this.hideUserDialog();
        window.location.reload();
      },
      error: (error: any) => {
        this.showErrorMessage(error.error.message);
      },
    })
  }
  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: detail,
      life: 3000,
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: detail,
      life: 3000,
    });
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
          ...(this.user && this.user.role !== "CUSTOMER"
            ? [
                {
                  label: "Upgrade Member",
                  icon: "pi pi-dollar",
                  command: () => {
                    this.createUserModal = true;
                  },
                },
              ]
            : []),
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
