/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'; // for matchers
import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import userEvent from '@testing-library/user-event';
// import { mockStore } from '../__mocks__/test-store.js';
import store from '../__mocks__/store.js';
import { each } from 'jquery';


const context = {
  document: document, // simule les interactions DOM
  onNavigate: null,
  store : null, // objet simulé, agit comme un magasin de données
  localStorage: window.localStorage,
}
const setContext = (ctx) => {
  context.document = ctx.document | context.document
  context.onNavigate = ctx.onNavigate | context.onNavigate
  context.store = ctx.store | context.store
  context.localStorage = ctx.localStorage | context.localStorage
}

describe("Given I am connected as an employee, for vertical layout", () => {
  beforeAll(()=> {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
  })

  describe("When I am on NewBill Page", () => {

    test("Then newBill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList).toBeTruthy()
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
  })

  describe("When I am on NewBill Page", () => {

    beforeEach(()=>{
      setContext({
        document: document, // simule les interactions DOM
        onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) }, // simule la navigation en prenant un chemin "path" et modifie le contenu de la page
        store : null, // objet simulé, agit comme un magasin de données
        localStorage: window.localStorage,
      })
      document.body.innerHTML = NewBillUI()
    })

    test("Then when le bouton -choisir un fichier- est bien de type file et required", () => {
      // const html = NewBillUI()
      const input = screen.getByTestId("file");
      expect(input).toHaveAttribute('type', 'file')
      expect(input.required).toBe(true)
    })

    test("handleChangeFile is call when the btn new bill is click", () => {
      const bill = new NewBill(context)
      const btn = waitFor(()=>screen.getByTestId("file"))
      const handleChangeFileFn = jest.fn((e) => (bill.handleChangeFile(e)))
      btn.addEventListener('click', handleChangeFileFn)
      userEvent.click(btn)
      expect(handleChangeFileFn).toHaveBeenCalled()
      btn.removeEventListener('click', handleChangeFileFn )
    })

    // TODO wrong/good file

    test("Proof : test allowed upload type files : JPG, JPEG, PNG", () => {
      const bill = new NewBill(context)
      
      const btn = waitFor(() => screen.getByTestId("file"))
      const wrongFile = new File(['toto'], 'toto.txt', { type: 'text/plain' })
      const handleChangeFileFn = jest.fn((e) => (bill.handleChangeFile(e)))
      btn.addEventListener('click', handleChangeFileFn)
      userEvent.upload(btn, wrongFile)
      const errorDiv = screen.getByText("Extension de fichier non valide. Sélectionner un fichier JPG, JPEG ou PNG")
      // const error = document.querySelector("#file-error")
     
      expect(btn.files[0]).toStrictEqual(wrongFile)
      expect(errorDiv).toBeInTheDocument();
      btn.removeEventListener('click', handleChangeFileFn )
      // expect ($('#file-error').css('display')).toBe('block')
      // expect(error.style.display).toBe('block')
    })
 


    test("Submit, function handleSubmit", async () => {
      setContext ({
        document: document, // simule les interactions DOM
        onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) }, // simule la navigation en prenant un chemin "path" et modifie le contenu de la page
        store : store, // objet simulé, agit comme un magasin de données
        // store : null,
        localStorage: window.localStorage,
      })

      instance = new NewBill(context)
      document.body.innerHTML = NewBillUI()

      // All the input in the newBill form
      const expenseType = screen.getByTestId("expense-type")
      const expenseName = screen.getByTestId("expense-name")
      const expenseDatePicker = screen.getByTestId("datepicker")
      const expenseAmount = screen.getByTestId("amount")
      const expenseVat = screen.getByTestId("vat")
      const expensePct = screen.getByTestId("pct")
      const expenseCommentary = screen.getByTestId("commentary")
      const expenseFile = screen.getByTestId("file")
      

      /////////// MOCKED TEST STORE ///////////
      // // mocked data from __mock__store.js through test-store.js
      // let mockedName;

      // mockStore().then((mockedBills) => {
      //   mockedName = mockedBills[0].name
      // })

      /////////// MOCKED STORE  ///////////
      let mockedType;
      let mockedName;
      let mockedDatePicker;
      let mockedAmount;
      let mockedVat;
      let mockedPct;
      let mockedCommentary = 'testValue'
      let mockedFileName;

      await store.bills().list()
      .then(async (bills) => {

        function mockData(data) {
          if (typeof data.value !== 'string') {
            data = data.toString()
          }
          return bills[0][data]
        }

        mockedType = await mockData('type')
        mockedName = await mockData('name')
        mockedDatePicker = await mockData('date')
        mockedAmount = await mockData('amount')
        mockedVat = await mockData('vat')
        mockedPct = await mockData('pct')
        // mockedFileName = await mockData('fileName')

        // userEvent.selectOptions(expenseType, mockedType)
        // userEvent.type(expenseName, mockedName)
        // userEvent.type(expenseDatePicker, mockedDatePicker)
        userEvent.type(expenseAmount, mockedAmount)
        userEvent.type(expenseVat, mockedVat)
        userEvent.type(expensePct, mockedPct)
        userEvent.type(expenseCommentary, mockedCommentary)
        // userEvent.upload(expenseFile, mockedFileName)

      
        // expect(expenseType.value).toBe(mockedType)
        // expect(expenseName.value).toBe(mockedName)
        // expect(expenseDatePicker.value).toBe(mockedDatePicker)
        expect(expenseAmount.value).toBe(mockedAmount)
        expect(expenseVat.value).toBe(mockedVat)
        expect(expensePct.value).toBe(mockedPct)
        expect(expenseCommentary.value).toBe(mockedCommentary)
        // expect(expenseFile.value).toStrictEqual(mockedFileName)
      })
    
    }) 
  })
})



// tester POST handleSubmit
// quand je clique sur envoyer je reviens sur la page bills
// Uncovered lines 38-56,59-76,81-88
// tester L'ID, status etc...???
