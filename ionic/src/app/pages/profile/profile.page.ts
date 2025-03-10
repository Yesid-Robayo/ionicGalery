import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  FormBuilder,  FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
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
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
   AlertController,
   LoadingController,
} from "@ionic/angular/standalone"
import  { AuthService, User } from "../../services/auth.service"

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
  ],
})
export class ProfilePage implements OnInit {
  user: User | null = null
  profileForm: FormGroup
  passwordForm: FormGroup

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
  ) {
    this.profileForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
    })

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    )
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.user = user
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
        })
      }
    })
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get("newPassword")?.value
    const confirmPassword = g.get("confirmPassword")?.value

    return newPassword === confirmPassword ? null : { mismatch: true }
  }

  async updateProfile() {
    const loading = await this.loadingController.create({
      message: "Actualizando perfil...",
    })
    await loading.present()

    this.authService
      .updateProfile({
        name: this.profileForm.value.name,
        email: this.profileForm.value.email,
      })
      .subscribe({
        next: async () => {
          await loading.dismiss()
          const alert = await this.alertController.create({
            header: "Éxito",
            message: "Perfil actualizado correctamente",
            buttons: ["OK"],
          })
          await alert.present()
        },
        error: async (error) => {
          await loading.dismiss()
          const alert = await this.alertController.create({
            header: "Error",
            message: error.error?.message || "No se pudo actualizar el perfil",
            buttons: ["OK"],
          })
          await alert.present()
        },
      })
  }

  async updatePassword() {
    const loading = await this.loadingController.create({
      message: "Actualizando contraseña...",
    })
    await loading.present()

    this.authService
      .updateProfile({
        password: this.passwordForm.value.newPassword,
      })
      .subscribe({
        next: async () => {
          await loading.dismiss()
          const alert = await this.alertController.create({
            header: "Éxito",
            message: "Contraseña actualizada correctamente",
            buttons: ["OK"],
          })
          await alert.present()
          this.passwordForm.reset()
        },
        error: async (error) => {
          await loading.dismiss()
          const alert = await this.alertController.create({
            header: "Error",
            message: error.error?.message || "No se pudo actualizar la contraseña",
            buttons: ["OK"],
          })
          await alert.present()
        },
      })
  }

  get name() {
    return this.profileForm.get("name")
  }

  get email() {
    return this.profileForm.get("email")
  }

  get currentPassword() {
    return this.passwordForm.get("currentPassword")
  }

  get newPassword() {
    return this.passwordForm.get("newPassword")
  }

  get confirmPassword() {
    return this.passwordForm.get("confirmPassword")
  }
}

