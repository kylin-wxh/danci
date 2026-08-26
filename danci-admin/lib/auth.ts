export type AdminUser = {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

const USERS_KEY = "danci-admin-users"
const CURRENT_USER_KEY = "danci-admin-current-user"

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getUsers(): AdminUser[] {
  return readJSON<AdminUser[]>(USERS_KEY, [])
}

export function getCurrentUser(): AdminUser | null {
  return readJSON<AdminUser | null>(CURRENT_USER_KEY, null)
}

export function setCurrentUser(user: AdminUser | null) {
  if (typeof window === "undefined") return
  if (user) {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export function signup(input: {
  name: string
  email: string
  password: string
}): AuthResult<AdminUser> {
  const users = getUsers()
  const email = input.email.trim().toLowerCase()

  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: "该邮箱已被注册" }
  }

  const user: AdminUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
  }

  writeJSON(USERS_KEY, [...users, user])
  return { ok: true, data: user }
}

export function signin(input: {
  email: string
  password: string
}): AuthResult<AdminUser> {
  const users = getUsers()
  const email = input.email.trim().toLowerCase()
  const user = users.find((u) => u.email.toLowerCase() === email)

  if (!user || user.password !== input.password) {
    return { ok: false, error: "邮箱或密码错误" }
  }

  return { ok: true, data: user }
}