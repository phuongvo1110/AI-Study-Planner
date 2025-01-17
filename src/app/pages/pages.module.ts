import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FullCalendarModule } from "@fullcalendar/angular";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { TasksComponent } from "./tasks/tasks.component";
import { PagesRoutingModule } from "./pages-routing.module";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RippleModule } from "primeng/ripple";
import { DialogModule } from "primeng/dialog";
import { InputTextareaModule } from "primeng/inputtextarea";
import { CalendarModule } from "primeng/calendar";
import { ToastModule } from "primeng/toast";
import { AnalyticsComponent } from "./analytics/analytics.component";
import { ProfileComponent } from "./profile/profile.component";
import { PasswordModule } from "primeng/password";
import { PaginatorModule } from "primeng/paginator";
import { TabViewModule } from "primeng/tabview";
import { PanelModule } from "primeng/panel";
import { SharedModule } from "../shared/shared.module";
import { ChartModule } from "primeng/chart";
import { DividerModule } from "primeng/divider";
import { TooltipModule } from "primeng/tooltip";

@NgModule({
    imports: [
        CommonModule,
        FullCalendarModule,
        PagesRoutingModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TableModule,
        ReactiveFormsModule,
        FormsModule,
        DialogModule,
        InputTextareaModule,
        CalendarModule,
        ToastModule,
        PasswordModule,
        PaginatorModule,
        TabViewModule,
        PanelModule,
        SharedModule,
        ChartModule,
        DividerModule,
        TooltipModule
    ],
    declarations: [WorkspaceComponent, TasksComponent, AnalyticsComponent, ProfileComponent],
})
export class PagesModule {}