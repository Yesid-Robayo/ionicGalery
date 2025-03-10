import { Component } from "@angular/core"
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from "@ionic/angular/standalone"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { AuthService } from "./services/auth.service"
import { Router } from "@angular/router"
import { addIcons } from "ionicons"
import { home, images, person, logOut } from "ionicons/icons"

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: true,
  imports: [
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
})
export class AppComponent {
  public appPages = [
    { title: "Inicio", url: "/home", icon: "home" },
    { title: "Galería", url: "/gallery", icon: "images" },
    { title: "Perfil", url: "/profile", icon: "person" },
  ]

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons({ home, images, person, logOut })
  }

  logout() {
    this.authService.logout()
    this.router.navigateByUrl("/login", { replaceUrl: true })
  }
}

