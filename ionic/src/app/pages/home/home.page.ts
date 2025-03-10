import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
} from "@ionic/angular/standalone"
import  { AuthService } from "../../services/auth.service"
import  { PhotoService } from "../../services/photo.service"
import { RouterLink } from "@angular/router"
import { addIcons } from "ionicons"
import { images, person } from "ionicons/icons"

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon,
    RouterLink,
  ],
})
export class HomePage implements OnInit {
  user: any
  photoCount = 0
  cloudPhotoCount = 0

  constructor(
    private authService: AuthService,
    private photoService: PhotoService,
  ) {
    addIcons({ images, person })
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user
    })

    this.photoService.photos$.subscribe((photos) => {
      this.photoCount = photos.length
      this.cloudPhotoCount = photos.filter((p) => p.isCloud).length
    })

    this.loadPhotos()
  }

  async loadPhotos() {
    await this.photoService.loadSaved()
  }
}

