import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { AuthService } from "../services/auth.service"
import { filter, map, take } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class AutoLoginGuard implements CanActivate {
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
          this.router.navigateByUrl("/home", { replaceUrl: true })
          return false
        } else {
          return true
        }
      }),
    )
  }
}

