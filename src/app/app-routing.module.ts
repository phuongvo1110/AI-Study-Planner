import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from "./helpers/auth.guard";

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: "",
          component: AppLayoutComponent,
          children: [
            {
              path:'',
              loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
              canActivate: [AuthGuard]
            },
          ],
        }
      ],
      {
        scrollPositionRestoration: "enabled",
        anchorScrolling: "enabled",
        onSameUrlNavigation: "reload",
      }
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
