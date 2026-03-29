export const getUser = () => {
  const user = localStorage.getItem('nkvarazdin_user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('nkvarazdin_user')
}

export const logout = () => {
  localStorage.removeItem('nkvarazdin_user')
}