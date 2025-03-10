import { Injectable } from "@angular/core"
import { Camera, CameraResultType, CameraSource, type Photo } from "@capacitor/camera"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Preferences } from "@capacitor/preferences"
import { Platform } from "@ionic/angular/standalone"
import { Capacitor } from "@capacitor/core"
import  { HttpClient } from "@angular/common/http"
import { environment } from "../../environments/environment"
import { BehaviorSubject } from "rxjs"
import { AuthService } from "./auth.service"

export interface UserPhoto {
  id?: number
  filepath: string
  webviewPath?: string
  cloudPath?: string
  isCloud: boolean
}

@Injectable({
  providedIn: "root",
})
export class PhotoService {
  public photos: UserPhoto[] = []
  private PHOTO_STORAGE = "photos"
  private platform: Platform
  private photoSubject = new BehaviorSubject<UserPhoto[]>([])
  public photos$ = this.photoSubject.asObservable()

  constructor(
    platform: Platform,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.platform = platform
  }

  public async loadSaved() {
    // Load photos from local storage
    const photoList = await Preferences.get({ key: this.PHOTO_STORAGE })
    this.photos = photoList.value ? JSON.parse(photoList.value) : []

    // Load cloud photos
    await this.loadCloudPhotos()

    // If running on the web...
    if (!this.platform.is("hybrid")) {
      // Display the photo by reading into base64 format
      for (const photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        if (!photo.isCloud) {
          const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data,
          })

          // Web platform only: Load the photo as base64 data
          photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`
        }
      }
    }

    this.photoSubject.next(this.photos)
  }

  private async loadCloudPhotos() {
    try {
      const response = await this.http.get<any[]>(`${environment.apiUrl}/photos`).toPromise()

      // Add cloud photos to the photos array
      const cloudPhotos = (response ?? []).map((item) => ({
        id: item.id,
        filepath: item.filename,
        webviewPath: `${environment.apiUrl}/photos/${item.filename}`,
        cloudPath: item.filename,
        isCloud: true,
      }))

      // Merge local and cloud photos
      this.photos = [...this.photos.filter((p) => !p.isCloud), ...cloudPhotos]

      // Save to storage
      Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
      })
    } catch (error) {
      console.error("Error loading cloud photos", error)
    }
  }

  public async addNewToGallery(saveToCloud = false) {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    })

    if (saveToCloud) {
      return this.saveToCloud(capturedPhoto)
    } else {
      const savedImageFile = await this.savePicture(capturedPhoto)
      this.photos.unshift(savedImageFile)

      // Save all photos for future retrieval
      Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
      })

      this.photoSubject.next(this.photos)
    }
  }

  private async savePicture(photo: Photo): Promise<UserPhoto> {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo)

    // Write the file to the data directory
    const fileName = Date.now() + ".jpeg"
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    })

    if (this.platform.is("hybrid")) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        isCloud: false,
      }
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
        isCloud: false,
      }
    }
  }

  private async saveToCloud(photo: Photo) {
    try {
      // Convert photo to blob
      const blob = await this.readAsBlob(photo)

      // Create form data
      const formData = new FormData()
      formData.append("photo", blob)

      // Upload to server
      const response = await this.http
        .post<{ id: number; filename: string }>(`${environment.apiUrl}/photos/upload`, formData)
        .toPromise()

      // Add to photos array
      const newPhoto: UserPhoto = {
        id: response?.id ?? 0,
        filepath: response?.filename ?? '',
        webviewPath: `${environment.apiUrl}/photos/${response?.filename ?? ''}`,
        cloudPath: response?.filename ?? '',
        isCloud: true,
      }

      this.photos.unshift(newPhoto)

      // Save to storage
      Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
      })

      this.photoSubject.next(this.photos)
    } catch (error) {
      console.error("Error uploading to cloud", error)
      throw error
    }
  }

  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is("hybrid")) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!,
      })

      return file.data
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!)
      const blob = await response.blob()

      return (await this.convertBlobToBase64(blob)) as string
    }
  }

  private async readAsBlob(photo: Photo) {
    if (this.platform.is("hybrid")) {
      // Read the file and convert to blob
      const file = await Filesystem.readFile({
        path: photo.path!,
      })

      // Convert base64 to blob
      const response = await fetch(`data:image/jpeg;base64,${file.data}`)
      return await response.blob()
    } else {
      // Fetch the photo, read as a blob
      const response = await fetch(photo.webPath!)
      return await response.blob()
    }
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = reject
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })

  public async deletePhoto(photo: UserPhoto) {
    // Remove this photo from the Photos reference array
    this.photos = this.photos.filter((p) => p.filepath !== photo.filepath)

    // Update photos in storage
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    })

    // Delete photo file if it's local
    if (!photo.isCloud) {
      // Delete photo file from filesystem
      const filename = photo.filepath.substr(photo.filepath.lastIndexOf("/") + 1)
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Data,
      })
    } else if (photo.id) {
      // Delete from cloud
      try {
        await this.http.delete(`${environment.apiUrl}/photos/${photo.id}`).toPromise()
      } catch (error) {
        console.error("Error deleting cloud photo", error)
      }
    }

    this.photoSubject.next(this.photos)
  }

  public togglePhotoStorage(photo: UserPhoto) {
    if (photo.isCloud) {
      // Download from cloud to local
      return this.downloadFromCloud(photo)
    } else {
      // Upload to cloud
      return this.uploadLocalToCloud(photo)
    }
  }

  private async downloadFromCloud(photo: UserPhoto) {
    try {
      // Fetch the image from cloud
      if (!photo.webviewPath) {
        throw new Error("Photo webviewPath is undefined")
      }
      const response = await fetch(photo.webviewPath)
      const blob = await response.blob()

      // Convert to base64
      const base64Data = (await this.convertBlobToBase64(blob)) as string

      // Write to filesystem
      const fileName = Date.now() + ".jpeg"
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data.split(",")[1],
        directory: Directory.Data,
      })

      // Add as local photo
      const localPhoto: UserPhoto = {
        filepath: fileName,
        webviewPath: base64Data,
        isCloud: false,
      }

      // Replace in array
      const index = this.photos.findIndex((p) => p.filepath === photo.filepath)
      if (index !== -1) {
        this.photos[index] = localPhoto
      } else {
        this.photos.unshift(localPhoto)
      }

      // Update storage
      Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
      })

      this.photoSubject.next(this.photos)
    } catch (error) {
      console.error("Error downloading from cloud", error)
      throw error
    }
  }

  private async uploadLocalToCloud(photo: UserPhoto) {
    try {
      // Read file
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      })

      // Convert to blob
      const response = await fetch(`data:image/jpeg;base64,${readFile.data}`)
      const blob = await response.blob()

      // Create form data
      const formData = new FormData()
      formData.append("photo", blob)

      // Upload to server
      const uploadResponse = await this.http
        .post<{ id: number; filename: string }>(`${environment.apiUrl}/photos/upload`, formData)
        .toPromise()

      // Create cloud photo
      const cloudPhoto: UserPhoto = {
        id: uploadResponse?.id ?? 0,
        filepath: uploadResponse?.filename ?? '',
        webviewPath: `${environment.apiUrl}/photos/${uploadResponse?.filename ?? ''}`,
        cloudPath: uploadResponse?.filename ?? '',
        isCloud: true,
      }

      // Replace in array
      const index = this.photos.findIndex((p) => p.filepath === photo.filepath)
      if (index !== -1) {
        this.photos[index] = cloudPhoto
      } else {
        this.photos.unshift(cloudPhoto)
      }

      // Update storage
      Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
      })

      this.photoSubject.next(this.photos)
    } catch (error) {
      console.error("Error uploading to cloud", error)
      throw error
    }
  }
}

