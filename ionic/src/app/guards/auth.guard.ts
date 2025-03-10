import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { AuthService } from "../services/auth.service"
import { filter, map, take } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate() {
    return this.authService.isAuthenticated$.pipe(
      filter((val) => val !== null), // Filter out initial null value
      take(1), // Otherwise the Observable doesn't complete!
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true
        } else {
          this.router.navigateByUrl("/login")
          return false
        }
      }),
    )
  }
}

