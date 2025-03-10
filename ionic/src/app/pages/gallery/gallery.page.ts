import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonBadge,
  IonFab,
  IonFabButton,
  IonIcon,
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  IonModal,
  IonButton,
} from "@ionic/angular/standalone"
import { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import { PhotoService, UserPhoto } from "../../services/photo.service"
import { addIcons } from "ionicons"
import { camera, save, cloudUpload, cloudDownload, trash, close, expand } from "ionicons/icons"
import { HttpClient } from "@angular/common/http"

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.page.html",
  styleUrls: ["./gallery.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonBadge,
    IonFab,
    IonFabButton,
    IonIcon,
    IonModal,
    IonButton,
  ],
})
export class GalleryPage implements OnInit {
  photos: UserPhoto[] = []
  selectedPhoto: UserPhoto | null = null
  isModalOpen = false
  // Caché para las URLs convertidas
  private imageCache: Map<string, SafeUrl> = new Map()
  // Indicador de imágenes que se están procesando
  private processingImages: Set<string> = new Set()

  constructor(
    public photoService: PhotoService,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    addIcons({ camera, save, cloudUpload, cloudDownload, trash, close, expand })
  }

  async ngOnInit() {
    await this.photoService.loadSaved()
    this.photoService.photos$.subscribe((photos) => {
      this.photos = photos
      console.log(this.photos)

      // Pre-procesar todas las imágenes de la nube al cargar
      photos.forEach(photo => {
        if (photo.isCloud && photo.webviewPath) {
          this.convertCloudImageToJpg(photo)
        }
      })
    })
  }

  getSafeImageUrl(photo: any): SafeUrl {
    // Generamos una clave única para la caché
    const cacheKey = photo.id || photo.filepath || photo.webviewPath || ''

    // Para imágenes en la nube, usamos la versión JPG si ya está en caché
    if (photo.isCloud) {
      // Si ya tenemos la versión convertida, la devolvemos
      if (this.imageCache.has(cacheKey)) {
        return this.imageCache.get(cacheKey)!
      }

      // Si la imagen aún no está procesada, la procesamos
      if (!this.processingImages.has(cacheKey)) {
        this.processingImages.add(cacheKey)
        this.convertCloudImageToJpg(photo)
      }

      // Mientras tanto, devolvemos una URL temporal
      return this.sanitizer.bypassSecurityTrustUrl('assets/loading-image.jpg')
    }
    // Para imágenes locales, simplemente devolvemos la URL segura
    else {
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(photo.webviewPath)
      return safeUrl
    }
  }

  // Versión sincronizada que actualiza la UI cuando termina
  async convertCloudImageToJpg(photo: UserPhoto): Promise<void> {
    try {
      // Solo procesamos si tenemos una URL web válida
      if (!photo.webviewPath) return

      const cacheKey = photo.id || photo.filepath || photo.webviewPath || ''

      // Obtenemos el blob de la imagen
      const response = await fetch(photo.webviewPath)
      const blob = await response.blob()

      // Convertimos explícitamente a JPEG
      const jpgBlob = new Blob([blob], { type: 'image/jpeg' })

      // Creamos una URL para el blob
      const url = URL.createObjectURL(jpgBlob)

      // Creamos una URL segura
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url)

      // Actualizamos la caché con la versión JPG
      this.imageCache.set(cacheKey as any, safeUrl)
      this.processingImages.delete(cacheKey as any)

      // Forzamos una actualización de la UI
      setTimeout(() => {
        // Esto fuerza Angular a actualizar la vista
        this.photos = [...this.photos]
      }, 0)
    } catch (error) {
      console.error('Error al convertir imagen a JPG:', error)

      // En caso de error, marcamos como no procesando
      const cacheKey = photo.id || photo.filepath || photo.webviewPath || ''
      this.processingImages.delete(cacheKey as any)

      // Fallback a la URL original
      this.imageCache.set(cacheKey as any, this.sanitizer.bypassSecurityTrustUrl(photo.webviewPath as any))
    }
  }

  openImageModal(photo: UserPhoto, event: Event) {
    event.stopPropagation() // Prevenir la acción de clic de la tarjeta
    this.selectedPhoto = photo
    this.isModalOpen = true
  }

  closeModal() {
    this.isModalOpen = false
    this.selectedPhoto = null
  }

  async addPhotoToGallery() {
    const actionSheet = await this.actionSheetController.create({
      header: "Selecciona una opción",
      buttons: [
        {
          text: "Guardar localmente",
          icon: "save",
          handler: async () => {
            await this.photoService.addNewToGallery(false)
            await this.photoService.loadSaved()
          },
        },
        {
          text: "Guardar en la nube",
          icon: "cloud-upload",
          handler: async () => {
            await this.photoService.addNewToGallery(true)
            await this.photoService.loadSaved()

          },
        },
        {
          text: "Cancelar",
          icon: "close",
          role: "cancel",
        },
      ],
    })
    await actionSheet.present()
  }

  async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: "Opciones de foto",
      buttons: [
        {
          text: "Ver ampliada",
          icon: "expand",
          handler: () => {
            this.openImageModal(photo, new Event('custom'))
          },
        },
        {
          text: photo.isCloud ? "Descargar a local" : "Subir a la nube",
          icon: photo.isCloud ? "cloud-download" : "cloud-upload",
          handler: () => {
            this.togglePhotoStorage(photo)
          },
        },
        {
          text: "Eliminar",
          role: "destructive",
          icon: "trash",
          handler: () => {
            this.deletePhoto(photo)
          },
        },
        {
          text: "Cancelar",
          icon: "close",
          role: "cancel",
        },
      ],
    })
    await actionSheet.present()
  }

  async togglePhotoStorage(photo: UserPhoto) {
    const loading = await this.loadingController.create({
      message: photo.isCloud ? "Descargando..." : "Subiendo...",
    })
    await loading.present()

    try {
      await this.photoService.togglePhotoStorage(photo)
      await loading.dismiss()
    } catch (error) {
      await loading.dismiss()
      const alert = await this.alertController.create({
        header: "Error",
        message: "No se pudo completar la operación",
        buttons: ["OK"],
      })
      await alert.present()
    }
  }

  async deletePhoto(photo: UserPhoto) {
    const alert = await this.alertController.create({
      header: "Confirmar eliminación",
      message: "¿Estás seguro de que deseas eliminar esta foto?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Eliminar",
          handler: async () => {
            const loading = await this.loadingController.create({
              message: "Eliminando...",
            })
            await loading.present()

            try {
              await this.photoService.deletePhoto(photo)
              await loading.dismiss()
            } catch (error) {
              await loading.dismiss()
              const errorAlert = await this.alertController.create({
                header: "Error",
                message: "No se pudo eliminar la foto",
                buttons: ["OK"],
              })
              await errorAlert.present()
            }
          },
        },
      ],
    })
    await alert.present()
  }
}