type AuthData = {
  accessToken?: string
  refreshToken?: string
}

export const getUser = (): AuthData | null => {
  const user = localStorage.getItem('nkvarazdin_user')
  return user ? JSON.parse(user) : null
}

export const getAccessToken = (): string | null => {
  const user = getUser()
  return user?.accessToken ?? null
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}

export const logout = (): void => {
  localStorage.removeItem('nkvarazdin_user')
}