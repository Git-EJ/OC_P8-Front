/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'; // for matchers
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import userEvent from '@testing-library/user-event';
import store from '../__mocks__/store.js';


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
      email: 'a@a'
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
        document,
        onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) },
        store : null,
        localStorage: window.localStorage,
      })
      document.body.innerHTML = NewBillUI()
    })


    test("Then when le bouton -choisir un fichier- est bien de type file", () => {
      const input = screen.getByTestId("file");
      expect(input).toHaveAttribute('type', 'file')
    })


    test("handleChangeFile is call when the btn new bill is click", () => {
      const bill = new NewBill(context)
      const btn = screen.getByTestId("file")
      const handleChangeFileFn = jest.fn((e) => (bill.handleChangeFile(e)))
      btn.addEventListener('click', handleChangeFileFn)
      userEvent.click(btn)
      expect(handleChangeFileFn).toHaveBeenCalledTimes(1)
      btn.removeEventListener('click', handleChangeFileFn )
    })
    
    // // TODO good file / wrong, file is like not upload always error message
    // test("Proof : test allowed upload type files : JPG, JPEG, PNG", async () => {

    //   await store.bills()
    //   .list()
    //   .then(async (bills) => {
    //     const bill = new NewBill(context)
    //     const btn = await waitFor (() => screen.getByTestId("file"))
    //     const fileNameMessage = await waitFor(() => screen.getByTestId('file-name-message'))
        
    //     const goodFileName = await waitFor(() => bills[0].fileName)
    //     const lastIndex = goodFileName.lastIndexOf('.')
    //     const goodFileNoExtension = lastIndex !== -1 ? goodFileName.slice(0, lastIndex) : goodFileName
    //     const goodFile = new File([goodFileNoExtension], goodFileName , {type: 'image/jpg'} )
      
    //     // const goodFile = new File(['toto'], 'toto.png', { type: 'image/png' })

    //     const handleChangeFileFn = jest.fn((e) => (bill.handleChangeFile(e)))
    //     btn.addEventListener('click', handleChangeFileFn)
    //     userEvent.upload(btn, goodFile)

    //     expect(handleChangeFileFn).toHaveBeenCalledTimes(1)
    //     expect(btn.files[0]).toBe(goodFile)
    //     expect(btn.files.length).toBe(1)
    //     expect(btn.files[0].name).toBe(goodFile.name)
    //     expect(typeof btn.files[0]).toBe('object')
    //     expect(fileNameMessage).toBeInTheDocument()
    //     expect(fileNameMessage).not.toBeEmptyDOMElement()

    //     btn.removeEventListener('change', handleChangeFileFn )
    //   })
    // })

    // test("Proof : test unallowed upload type files !== JPG, JPEG, PNG", () => {
    //   const bill = new NewBill(context)
      
    //   const btn = screen.getByTestId("file")
    //   const wrongFile = new File(['toto'], 'toto.txt', { type: 'text/plain' })
    //   const handleChangeFileFn = jest.fn((e) => (bill.handleChangeFile(e)))
    //   btn.addEventListener('click', handleChangeFileFn)
    //   userEvent.upload(btn, wrongFile.name)
    //   const fileErrorMessage = screen.getByTestId('file-error-message')
     
    //   expect(btn.files[0]).toBe(wrongFile.name)
    //   expect(fileErrorMessage).toBeInTheDocument()
    //   expect(fileErrorMessage).not.toBeEmptyDOMElement()

    //   btn.removeEventListener('click', handleChangeFileFn )
    //   // if (fileErrorMessage.textContent !== '') { fileErrorMessage.textContent = ''}
    //   // expect ($('#file-error').css('display')).toBe('block')
    //   // expect(error.style.display).toBe('block')
    // })

    test("NewBill form Validity and function submit >>> handleSubmit", async () => {
      setContext ({
        document: document, 
        onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) },
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

      // initialize data from __mocks__/store.js
      let mockedType;
      let mockedName;
      let mockedDatePicker;
      let mockedAmount;
      let mockedVat;
      let mockedPct;
      let mockedCommentary = 'commentary - testValue'
      let mockedFile;

      // data recovery from __mocks__/store.js
      await store.bills()
      .list()
      .then(async (bills) => {

        mockedType = await waitFor(() => bills[0].type)
        mockedName = await waitFor(() => bills[0].name) 
        mockedDatePicker = await waitFor(() => bills[0].date)
        mockedAmount = await waitFor(() => bills[0].amount.toString())
        mockedVat = await waitFor(() => bills[0].vat)
        mockedPct = await waitFor(() => bills[0].pct.toString())
        mockedFile = await waitFor(() => bills[0].fileName)

        //for file(proof)
        // const lastIndex = mockedFile.lastIndexOf('.')
        // const mockedFileNoExtension = lastIndex !== -1 ? mockedFile.slice(0, lastIndex) : mockedFile
        // const mockedFileName = new File([mockedFileNoExtension],mockedFile , {type: 'image/jpg'} )
        

        // simulates date user entry
        userEvent.selectOptions(expenseType, mockedType)
        userEvent.type(expenseName, mockedName) 
        userEvent.upload(expenseDatePicker, mockedDatePicker)
        userEvent.type(expenseAmount, mockedAmount)
        userEvent.type(expenseVat, mockedVat)
        userEvent.type(expensePct, mockedPct)
        userEvent.type(expenseCommentary, mockedCommentary)
        userEvent.upload(expenseFile, mockedFile)
        // userEvent.upload(expenseFile, mockedFileName.name)
        

        // check if the data.values entered are those expected
        expect(expenseType.value).toBe(mockedType)
        expect(expenseName.value).toBe(mockedName)
        expect(expenseDatePicker.files[0]).toBe(mockedDatePicker)
        expect(expenseAmount.value).toBe(mockedAmount)
        expect(expenseVat.value).toBe(mockedVat)
        expect(expensePct.value).toBe(mockedPct)
        expect(expenseCommentary.value).toBe(mockedCommentary)
        expect(expenseFile.files[0]).toBe(mockedFile)
        // expect(expenseFile.files[0]).toBe(mockedFileName.name)


        //check if fields type, date, amount, pct(tva), file >>> have required html attribute 
        expect (expenseType).toBeRequired()
        expect (expenseDatePicker).toBeRequired()
        expect (expenseAmount).toBeRequired()
        expect (expensePct).toBeRequired()
        expect (expenseFile).toBeRequired()

        //check fields type, date, amount, pct(tva), file >>> have value before submit
        expect (expenseType).toHaveValue()
        expect (expenseDatePicker.files.length).toBe(1)
        expect (expenseAmount).toHaveValue()
        expect (expensePct).toHaveValue()
        expect (expenseFile.files.length).toBe(1)

        // check if handleSubmit is call when the submit btn is click
        // check if when handleSubmit was called, handleSubmit call updateBill and onNavigate
        const bill = new NewBill(context)
        const form = screen.getByTestId('form-new-bill')
        const submitBtn = screen.getByTestId('btn-submit-bill')
        const spyHandleSubmit = jest.spyOn(bill, 'handleSubmit')
        const spyUpdateBill = jest.spyOn(bill, 'updateBill')
        const spyOnNavigate = jest.spyOn(bill, 'onNavigate')
        
        form.addEventListener('submit', spyHandleSubmit)
        userEvent.click(submitBtn)
        expect(spyHandleSubmit).toHaveBeenCalledTimes(1)
        expect(spyUpdateBill).toHaveBeenCalledTimes(2) // TODO why "2 call"
        expect(spyOnNavigate).toHaveBeenCalledTimes(2) // TODO why "2 call"
        submitBtn.removeEventListener('submit', spyHandleSubmit)

        // check if user is redirected to bills page after submit
        const billsPage = await waitFor(() => screen.getAllByTestId('employee-bills-page'))
        expect(billsPage).toHaveLength(1)
      })
    }) 
  })
})














// TODO
// tester POST handleSubmit
// quand je clique sur envoyer je reviens sur la page bills
// tester L'ID, status etc...???
