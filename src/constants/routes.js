import LoginUI from "../views/LoginUI.js"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import DashboardUI from "../views/DashboardUI.js"

export const ROUTES_PATH = {
  Login: '/',
  Bills: '#employee/bills',
  NewBill : '#employee/bill/new',
  Dashboard: '#admin/dashboard',
  Error404: '#error/404',
  Error500: '#error/500'
}

export const ROUTES = ({ pathname, data, error, loading }) => {
  switch (pathname) {
    case ROUTES_PATH['Login']:
      return LoginUI({ data, error, loading })
    case ROUTES_PATH['Bills']:
      return BillsUI({ data, error, loading })
    case ROUTES_PATH['NewBill']:
      return NewBillUI()
    case ROUTES_PATH['Dashboard']:
      return DashboardUI({ data, error, loading })
    case ROUTES_PATH['Error404']:
      return `<h1 data-testid="page-error-title">Erreur 404</h1>`
    case ROUTES_PATH['Error500']:
      return `<h1 data-testid="page-error-title">Erreur 500</h1>`
    default:
      return LoginUI({ data, error, loading })
  }
}

