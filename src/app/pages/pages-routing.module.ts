import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { WorkspaceComponent } from "./workspace/workspace.component";
import { TasksComponent } from "./tasks/tasks.component";

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
            }
        ])
    ],
    exports: [RouterModule]
})
export class PagesRoutingModule {}