import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  AlertController,
  LoadingController,
  IonButtons,
  IonBackButton,
} from "@ionic/angular/standalone"
import { Router } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { RouterLink } from "@angular/router"
import { Preferences } from "@capacitor/preferences"

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonButtons,
    IonBackButton,
    RouterLink,
  ],
})
export class LoginPage implements OnInit {
  credentials: FormGroup

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
  ) {
    this.credentials = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  ngOnInit() { }

  async login() {
    const loading = await this.loadingController.create()
    await loading.present()

    this.authService.login(this.credentials.value.email, this.credentials.value.password).subscribe({
      next: async (res) => {
        
        await loading.dismiss()
        this.router.navigateByUrl("/home", { replaceUrl: true })
      },
      error: async (res) => {
        await loading.dismiss()
        const alert = await this.alertController.create({
          header: "Error de inicio de sesión",
          message: res.error?.message || "Por favor, verifica tus credenciales",
          buttons: ["OK"],
        })
        await alert.present()
      },
    })
  }

  get email() {
    return this.credentials.get("email")
  }

  get password() {
    return this.credentials.get("password")
  }
}

