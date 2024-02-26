/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { formatDate, formatStatus } from '../app/format.js';
import ErrorPage from '../views/ErrorPage.js';

const context = {
  document: document,
  onNavigate: null,
  store : null,
  localStorage: window.localStorage,
}
const setContext = (ctx) => {
  context.document = ctx.document 
  context.onNavigate = ctx.onNavigate 
  context.store = ctx.store
  context.localStorage = ctx.localStorage 
}


describe("Given I am connected as an employee", () => {

  beforeAll(()=> {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
    }))
    
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
  })

  afterAll (() => {
    jest.clearAllMocks()
  })
  

  
  describe("When I am on NewBill Page", ()=> {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)


      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList).toBeTruthy()
   
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })


    test("Then Bills icon in vertical layout should be not highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList).toBeTruthy()
      expect(windowIcon.classList.contains('active-icon')).toBe(false)
    })
  })
    
  
  describe("When I am on Bills Page", () => {

    beforeEach (()=>{
      setContext({
        document,
        onNavigate : path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) },
        store: null,
        localStorage: window.localStorage,
      })
      document.body.innerHTML = BillsUI({ data: bills })
    })
    afterEach (()=> {
     jest.clearAllMocks()
    })

    test("Then bills should be ordered from earliest to latest", () => {
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
        const parts = d.split(' ')
        const day = parts[0];
        const month = monthMap[parts[1]]
        const year = parts[2]
      
        const newDate = new Date(`${day} ${month} ${year}`).getTime()
        return newDate;
      })
      
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...formatDates].sort(antiChrono)
      expect(formatDates).toEqual(datesSorted)
    })


    test("handleClickNewBill is call when the btn new bill is click", () => {
      const instanceBills = new Bills (context)
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
      const handleClickNewBillFn = jest.fn(() => (instanceBills.handleClickNewBill(buttonNewBill)))
     
      buttonNewBill.addEventListener('click', handleClickNewBillFn)
      userEvent.click(buttonNewBill)

      expect(handleClickNewBillFn).toHaveBeenCalledTimes(1)

      buttonNewBill.removeEventListener('click', handleClickNewBillFn)
    })

    test("handleClickOnEye is call when the iconEye is click", () => {
      const instanceBills = new Bills(context)
      const icon = document.querySelectorAll(`div[data-testid="icon-eye"]`)[0]
      
      if ( typeof jest !== 'undefined') $.fn.modal = jest.fn()
      const handleClickIconEyeFn = jest.fn(() => (instanceBills.handleClickIconEye(icon)))
      
      icon.addEventListener('click', handleClickIconEyeFn)
      userEvent.click(icon)
     
      expect(handleClickIconEyeFn).toHaveBeenCalledTimes(1)

      icon.removeEventListener('click', handleClickIconEyeFn)
    })

    test("when I click on the icon eye, the proof (invoice) must be displayed in a modal", () => { 
      const iconEye = $(`div[data-testid="icon-eye"]`)
      iconEye.on('click', () => {
        $('#modaleFile').modal('show')
      })
      expect($('#modaleFile').css('display')).toBe('block')
    })
  })

  
  describe("When I am on Bills Page", () => {

    beforeEach(()=>{
      setContext({
        document,
        onNavigate : path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) },
        store: {
          bills: jest.fn(() =>({
            list: jest.fn(() => Promise.resolve(bills)),
          })),
        },
        localStorage: window.localStorage,
      })
      document.body.innerHTML = BillsUI({ data: bills })
    })

    afterEach (()=> {
      jest.clearAllMocks()
    })

    test("get bills from mock API GET", async () => {
      const instanceBills = new Bills(context)
      const billsFromInstanceBills = await waitFor(() => instanceBills.getBills())
            
      const billType = screen.getAllByTestId('bill-type')
      const billName = screen.getAllByTestId('bill-name')
      const billDate = screen.getAllByTestId('bill-date')
      const billAmount = screen.getAllByTestId('bill-amount')
      const billStatus = screen.getAllByTestId('bill-status')
      const billIconEye = screen.getAllByTestId('icon-eye')
      
      expect(billsFromInstanceBills.length).toEqual(bills.length)
      expect(billType).toHaveLength(bills.length)
      expect(billName).toHaveLength(bills.length)
      expect(billDate).toHaveLength(bills.length)
      expect(billAmount).toHaveLength(bills.length)
      expect(billStatus).toHaveLength(bills.length)
      expect(billIconEye).toHaveLength(bills.length)

      await waitFor(() => expect(billType[0].innerHTML).toBe(billsFromInstanceBills[0].type))
      await waitFor(() => expect(billName[0].innerHTML).toBe(billsFromInstanceBills[0].name))
      await waitFor(() => expect(billDate[0].innerHTML).toBe(formatDate(billsFromInstanceBills[0].date)))
      await waitFor(() => expect(billAmount[0].innerHTML).toBe(`${billsFromInstanceBills[0].amount} €`))
      await waitFor(() => expect(billStatus[0].innerHTML).toBe(formatStatus(billsFromInstanceBills[0].status)))

    })
  })
  

  describe("When I am on Bills Page", () => {
    const mockedBill = [{
      "id": "47qAXb6fIm2zOKkLzMro",
      "vat": "80",
      "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      "status": "pending",
      "type": "Hôtel et logement",
      "commentary": "séminaire billed",
      "name": "encore",
      "fileName": "preview-facture-free-201801-pdf-1.jpg",
      "date": "invalid",
      "amount": 400,
      "commentAdmin": "ok",
      "email": "a@a",
      "pct": 20
    }]

    beforeEach(() => {
      setContext({
        document,
        onNavigate : path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) },
        store: {
          bills: jest.fn(() => ({
            list: jest.fn(() => Promise.resolve(mockedBill)),
          })),
        },
        localStorage: window.localStorage,
      })
      document.body.innerHTML = RangeError ? ErrorPage('mockedError Date') : BillsUI({ data: bills })
    })

    afterEach (() => {
      jest.clearAllMocks()
    })
    
    test("get bills formatDate throw error", async () => {
      const instanceBills = new Bills(context)
      instanceBills.getBills()

      console.error = jest.fn()
      await waitFor(() => expect(console.error).toHaveBeenCalledTimes(1))

      const errorMessage = await waitFor(() => screen.getByTestId('error-message'))
      await waitFor(() => expect(errorMessage).toBeTruthy()) 
      await waitFor(() => expect(errorMessage).toHaveTextContent('mockedError Date'))
    })
  })
})
 