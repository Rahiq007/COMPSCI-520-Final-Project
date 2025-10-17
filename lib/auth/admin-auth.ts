import { cookies } from "next/headers"

export interface AdminSession {
  isAuthenticated: boolean
  userId?: string
  loginTime?: number
}

export class AdminAuth {
  private static readonly ADMIN_CREDENTIALS = {
    username: "RahiqAdminRTG",
    password: "RahiqStockAlgoAccess123!",
  }

  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  static async authenticate(username: string, password: string): Promise<boolean> {
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    console.log("Auth attempt:", {
      providedUsername: trimmedUsername,
      expectedUsername: this.ADMIN_CREDENTIALS.username,
      usernameMatch: trimmedUsername === this.ADMIN_CREDENTIALS.username,
      passwordMatch: trimmedPassword === this.ADMIN_CREDENTIALS.password,
    })

    return trimmedUsername === this.ADMIN_CREDENTIALS.username && trimmedPassword === this.ADMIN_CREDENTIALS.password
  }

  static async isAdmin(): Promise<boolean> {
    try {
      const cookieStore = await cookies()  // Added await
      const sessionCookie = cookieStore.get("admin-session")
      const loggedInCookie = cookieStore.get("admin-logged-in")

      console.log("Checking admin status, session cookie exists:", !!sessionCookie)
      console.log("Checking admin status, logged-in cookie exists:", !!loggedInCookie)
      console.log(
        "All cookies:",
        cookieStore.getAll().map((c) => c.name),
      )

      if (!sessionCookie) {
        console.log("No admin session cookie found")
        return false
      }

      const session = JSON.parse(sessionCookie.value)
      console.log("Session data:", {
        isAuthenticated: session.isAuthenticated,
        loginTime: session.loginTime,
        age: Date.now() - session.loginTime,
      })

      // Check if session is expired
      const isExpired = Date.now() - session.loginTime > this.SESSION_DURATION
      if (isExpired) {
        console.log("Admin session expired")
        return false
      }

      const isValid = session.isAuthenticated === true
      console.log("Admin session valid:", isValid)
      return isValid
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  static async getSession(): Promise<AdminSession> {
    try {
      const cookieStore = await cookies()  // Added await
      const sessionCookie = cookieStore.get("admin-session")

      if (!sessionCookie) {
        return { isAuthenticated: false }
      }

      const session = JSON.parse(sessionCookie.value)

      // Check if session is expired
      if (Date.now() - session.loginTime > this.SESSION_DURATION) {
        return { isAuthenticated: false }
      }

      return session
    } catch {
      return { isAuthenticated: false }
    }
  }
}
