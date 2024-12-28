import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { TasksComponent } from "./tasks/tasks.component";
import { AnalyticsComponent } from "./analytics/analytics.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'workspace',
                component: WorkspaceComponent
            },
            {
                path: 'tasks',
                component: TasksComponent
            },
            {
                path: 'analytics',
                component: AnalyticsComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class PagesRoutingModule {}