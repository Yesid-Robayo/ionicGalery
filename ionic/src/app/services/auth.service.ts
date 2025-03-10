import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { map, tap, BehaviorSubject } from "rxjs"
import { Preferences } from "@capacitor/preferences"
import { Capacitor } from "@capacitor/core"
import { environment } from "../../environments/environment"
import { Router } from "@angular/router"

const TOKEN_KEY = "auth-token"
const USER_KEY = "user-info"

export interface User {
  id: number
  email: string
  name: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private user = new BehaviorSubject<User | null>(null)
  private token = new BehaviorSubject<string | null>(null)

  user$ = this.user.asObservable()
  token$ = this.token.asObservable()
  isAuthenticated$ = this.token.pipe(map((token) => !!token))

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredToken()
  }

  async saveData(key: string, value: string) {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value })
    } else {
      localStorage.setItem(key, value)
    }
  }

  async getData(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const result = await Preferences.get({ key })
      return result.value
    } else {
      return localStorage.getItem(key)
    }
  }

  async removeData(key: string) {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key })
    } else {
      localStorage.removeItem(key)
    }
  }

  async loadStoredToken() {
    const token = await this.getData(TOKEN_KEY)
    if (token) {
      this.token.next(token)
      this.loadUser()
    } else {
      this.token.next(null)
      this.user.next(null)
    }
  }

  async loadUser() {
    const userData = await this.getData(USER_KEY)
    if (userData) {
      const user = JSON.parse(userData)
      this.user.next(user)
    }
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(async (res) => {
        this.token.next(res.token)
        this.user.next(res.user)
        await this.saveData(TOKEN_KEY, res.token)
        await this.saveData(USER_KEY, JSON.stringify(res.user))
      })
    )
  }

  register(name: string, email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(
      `${environment.apiUrl}/auth/register`,
      { name, email, password }
    ).pipe(
      tap(async (res) => {
        this.token.next(res.token)
        this.user.next(res.user)
        await this.saveData(TOKEN_KEY, res.token)
        await this.saveData(USER_KEY, JSON.stringify(res.user))
      })
    )
  }

  logout() {
    this.token.next(null)
    this.user.next(null)
    this.removeData(TOKEN_KEY)
    this.removeData(USER_KEY)
  }

  async getToken(): Promise<string | null> {
    const token = this.token.getValue()
    if (!token) {
      return await this.getData(TOKEN_KEY)
    }
    return token
  }


  getCurrentUser() {
    return this.user.getValue()
  }

  updateProfile(userData: { name?: string; email?: string; password?: string }) {
    return this.http.put<User>(`${environment.apiUrl}/users/profile`, userData).pipe(
      tap(async (updatedUser) => {
        const currentUser = this.user.getValue()
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser }
          this.user.next(newUser)
          await this.saveData(USER_KEY, JSON.stringify(newUser))
        }
      })
    )
  }
}