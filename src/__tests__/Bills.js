/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

let context;
let instance;

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    context = {
      document: document, // simule les interactions DOM
      onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) }, // simule la navigation en prenant un chemin "path" et modifie le contenu de la page
      store : null, // objet simulé, agit comme un magasin de données
      localStorage: window.localStorage,
    }
    beforeEach (()=>{
      onNavigate = context.onNavigate
      instance = new Bills(context)
      document.body.innerHTML = BillsUI({ data: bills })
      context.localStorage
   })
    afterEach (()=> {
    //  onNavigate = null
    //  instance =  null 
    //  document.body.innerHTML = null
     context.localStorage.clear()
     jest.restoreAllMocks()
   })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {

      // document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^([1-9]|[12][0-9]|3[01])[- /.]([A-Za-zÀ-ÖØ-öø-ÿ]{3})[.][- /.](\d{4})$/i).map(a => a.innerHTML)

      const monthMap = {
        "Jan.": "Jan",
        "Fév.": "Feb",
        "Mar.": "Mar",
        "Avr.": "Apr",
        "Mai.": "May",
        "Jui.": "Jun",
        "Jul.": "Jul",
        "Aoû.": "Aug",
        "Sep.": "Sep",
        "Oct.": "Oct",
        "Nov.": "Nov",
        "Déc.": "Dec",
      }
      
      const formatDates = dates.map(d => {
        console.log("d===", d)
        const parts = d.split(' ')
        const day = parts[0];
        const month = monthMap[parts[1]]
        const year = parts[2]
      
        const newDate = new Date(`${day} ${month} ${year}`).getTime()
        console.log('NewDate ===', newDate)
        return newDate;
      })
      
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...formatDates].sort(antiChrono)
      expect(formatDates).toEqual(datesSorted)
    })
  })

  test("handleClickNewBill is call when the btn new bill is click", () => {
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if ( typeof jest !== 'undefined') $.fn.onNavigate = jest.fn()
    const store = null
    const instanceTest = new Bills ({
          document,
          onNavigate : $.fn.onNavigate,
          store,
          localStorage : window.localStorage
        })
    const handleClickNewBillFn = jest.fn(() => (instanceTest.handleClickNewBill(buttonNewBill)))
    buttonNewBill.addEventListener('click', handleClickNewBillFn)
    userEvent.click(buttonNewBill)
    expect(handleClickNewBillFn).toHaveBeenCalledTimes(1)
  })

  test("handleClickOnEye is call when the iconEye is click", () => {
      const icon = document.querySelectorAll(`div[data-testid="icon-eye"]`)[0]
      if ( typeof jest !== 'undefined') $.fn.modal = jest.fn()
      const handleClickIconEyeFn = jest.fn(() => (instance.handleClickIconEye(icon)))
      icon.addEventListener('click', handleClickIconEyeFn)
      userEvent.click(icon)
      expect(handleClickIconEyeFn).toHaveBeenCalledTimes(1)
  })

  test("when I click on the icon eye, the proof (invoice) must be displayed in a modal", () => { 
    const iconEye = $(`div[data-testid="icon-eye"]`)
    iconEye.on('click', () => {
      $('#modaleFile').modal('show')
    })
    expect($('#modaleFile').css('display')).toBe('block')
  })
})

// // test d'intégration GET
// describe("Given I am a user connected as Employee", () => {
//   describe("When I display bill (from API GET) in a modal", () => {
//     test("fetches bills from mock API GET", async () => {
//       localStorage.setItem("user", JSON.stringify({ type: "employee", email: "a@a" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.Bills)
//       // expected :  
            // - quand click sur  icon-eye recuperation de la note de frais correspondante 
            // - une fois recuperée et valide => affichage
            // - si pas de note et/ou invalide(null) => message d'erreur 404, et 500(dashboard-test)???
//     })
//   })
// })


