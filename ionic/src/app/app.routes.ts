import type { Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"
import { AutoLoginGuard } from "./guards/auto-login.guard"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () => import("./pages/login/login.page").then((m) => m.LoginPage),
    canActivate: [AutoLoginGuard],
  },
  {
    path: "register",
    loadComponent: () => import("./pages/register/register.page").then((m) => m.RegisterPage),
    canActivate: [AutoLoginGuard],
  },
  {
    path: "home",
    loadComponent: () => import("./pages/home/home.page").then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: "gallery",
    loadComponent: () => import("./pages/gallery/gallery.page").then((m) => m.GalleryPage),
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    loadComponent: () => import("./pages/profile/profile.page").then((m) => m.ProfilePage),
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    redirectTo: "home",
  },
]

