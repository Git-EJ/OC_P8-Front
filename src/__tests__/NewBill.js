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
import store from '../__mocks__/store.js';


const context = {
  document: document, // simule les interactions DOM
  onNavigate: null,
  store : null, // objet simulé, agit comme un magasin de données
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
        document, // simule les interactions DOM
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
      const btn = screen.getByTestId("file")
      const handleChangeFileFn = jest.fn((e) => (bill.handleChangeFile(e)))
      btn.addEventListener('click', handleChangeFileFn)
      userEvent.click(btn)
      expect(handleChangeFileFn).toHaveBeenCalled()
      btn.removeEventListener('click', handleChangeFileFn )
    })

    // TODO wrong/good file

    test("Proof : test allowed upload type files : JPG, JPEG, PNG", () => {
      const bill = new NewBill(context)
      
      const btn = screen.getByTestId("file")
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

      document.body.innerHTML = NewBillUI()
      // All the input in the newBill form
      const expenseType = await waitFor(() => screen.getByTestId("expense-type"))
      const expenseName = await waitFor(() => screen.getByTestId("expense-name"))
      const expenseDatePicker = await waitFor(() => screen.getByTestId("datepicker"))
      const expenseAmount = screen.getByTestId("amount")
      const expenseVat = screen.getByTestId("vat")
      const expensePct = screen.getByTestId("pct")
      const expenseCommentary = screen.getByTestId("commentary")
      const expenseFile = await waitFor(() => screen.getByTestId("file"))
      // const expenseFile = await waitFor(() => screen.getByText("Billed"))


      let mockedType;
      let mockedName;
      let mockedDatePicker;
      let mockedAmount;
      let mockedVat;
      let mockedPct;
      let mockedCommentary = 'commentary - testValue'
      // let mockedFileName;

      await store.bills()
      .list()
      .then(async (bills) => {

        mockedType = await waitFor(() => bills[0].type)
        mockedName = await waitFor(() => bills[0].name) 
        mockedDatePicker = await waitFor(() => bills[0].date)
        mockedAmount = await waitFor(() => bills[0].amount.toString())
        mockedVat = await waitFor(() => bills[0].vat)
        mockedPct = await waitFor(() => bills[0].pct.toString())

        //for file(proof) simulate user upload with good extension (jpeg, jpg, png)
        const mockedFile = await waitFor(() => bills[0].fileName)
        // const lastIndex = mockedFile.lastIndexOf('.')
        // const mockedFileNoExtension = lastIndex !== -1 ? mockedFile.slice(0, lastIndex) : mockedFile
        // const mockedFileName = new File([mockedFileNoExtension],mockedFile , {type: 'image/jpg'} )
        
        userEvent.selectOptions(expenseType, mockedType)
        userEvent.type(expenseName, mockedName) 
        userEvent.upload(expenseDatePicker, mockedDatePicker)
        userEvent.type(expenseAmount, mockedAmount)
        userEvent.type(expenseVat, mockedVat)
        userEvent.type(expensePct, mockedPct)
        userEvent.type(expenseCommentary, mockedCommentary)
        userEvent.upload(expenseFile, mockedFile)
        // userEvent.upload(expenseFile, mockedFileName.name)
        
        expect(expenseType.value).toBe(mockedType)
        expect(expenseName.value).toBe(mockedName)
        expect(expenseDatePicker.files[0]).toBe(mockedDatePicker)
        expect(expenseAmount.value).toBe(mockedAmount)
        expect(expenseVat.value).toBe(mockedVat)
        expect(expensePct.value).toBe(mockedPct)
        expect(expenseCommentary.value).toBe(mockedCommentary)
        expect(expenseFile.files[0]).toBe(mockedFile)
        // expect(expenseFile.files[0]).toBe(mockedFileName.name)
      })
    }) 
  })
})


// tester POST handleSubmit
// quand je clique sur envoyer je reviens sur la page bills
// Uncovered lines 38-56,59-76,81-88
// tester L'ID, status etc...???
