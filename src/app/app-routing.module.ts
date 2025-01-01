import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { NotfoundComponent } from "./demo/components/notfound/notfound.component";
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
              path: "dashboard",
              loadChildren: () =>
                import("./demo/components/dashboard/dashboard.module").then(
                  (m) => m.DashboardModule
                ),
              canActivate: [AuthGuard],
            },
            {
              path:'',
              loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
              canActivate: [AuthGuard]
            },
            {
              path: "uikit",
              loadChildren: () =>
                import("./demo/components/uikit/uikit.module").then(
                  (m) => m.UIkitModule
                ),
            },
            {
              path: "utilities",
              loadChildren: () =>
                import("./demo/components/utilities/utilities.module").then(
                  (m) => m.UtilitiesModule
                ),
            },
            {
              path: "pages",
              loadChildren: () =>
                import("./demo/components/pages/pages.module").then(
                  (m) => m.PagesModule
                ),
            },
          ],
        },
        {
          path: "authenticate",
          loadChildren: () =>
            import("./account/account.module").then((m) => m.AccountModule),
        },
        {
          path: "auth",
          loadChildren: () =>
            import("./demo/components/auth/auth.module").then(
              (m) => m.AuthModule
            ),
        },
        {
          path: "landing",
          loadChildren: () =>
            import("./demo/components/landing/landing.module").then(
              (m) => m.LandingModule
            ),
        },
        { path: "notfound", component: NotfoundComponent },
        { path: "**", redirectTo: "/notfound" },
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
