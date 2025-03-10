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

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
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
export class RegisterPage implements OnInit {
  credentials: FormGroup

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
  ) {
    this.credentials = this.fb.group(
      {
        name: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    )
  }

  ngOnInit() { }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get("password")?.value
    const confirmPassword = g.get("confirmPassword")?.value

    return password === confirmPassword ? null : { mismatch: true }
  }

  async register() {
    const loading = await this.loadingController.create()
    await loading.present()

    this.authService
      .register(this.credentials.value.name, this.credentials.value.email, this.credentials.value.password)
      .subscribe({
        next: async (res) => {
          await loading.dismiss()
          this.router.navigateByUrl("/home", { replaceUrl: true })
        },
        error: async (res) => {
          await loading.dismiss()
          const alert = await this.alertController.create({
            header: "Error de registro",
            message: res.error?.message || "No se pudo completar el registro",
            buttons: ["OK"],
          })
          await alert.present()
        },
      })
  }

  get name() {
    return this.credentials.get("name")
  }

  get email() {
    return this.credentials.get("email")
  }

  get password() {
    return this.credentials.get("password")
  }

  get confirmPassword() {
    return this.credentials.get("confirmPassword")
  }
}

