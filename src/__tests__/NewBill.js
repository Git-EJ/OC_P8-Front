/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'; // for matchers
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
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
      // email: 'a@a'
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


  describe("When I am on NewBill Page", ()=> {

    beforeEach(()=>{
      setContext({
        document,
        onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) },
        store: {
          bills: jest.fn(() => ({
            create: jest.fn(() => Promise.resolve({
              file: "test.jpg",
              email: "a@a",
              headers: {
                noContentType: true,
              },
            })),
          })),
          localStorage: window.localStorage,
        }
      })
      document.body.innerHTML = NewBillUI()
    })

    afterEach(() => {
      jest.clearAllMocks() // Réinitialise tous les espions et les appels de fonction simulés
      // jest.resetAllMocks() // Réinitialise les mocks de fonctions seulement
    })
    
    
    
    test("Proof : test allowed upload type files : JPG, JPEG, PNG", async () => {
      const newBill = new NewBill(context);
      const btn = screen.getByTestId("file");
      const errorMessage = screen.getByTestId("file-error-message");
      // const handleChangeFileFn = spyOn(newBill, "handleChangeFile")

      const file = new File([""], "test.jpg", { type: "image/jpeg" });// [content], name, type MIME
      const event = {
        preventDefault: jest.fn(),
        target: { value: "C:\\fakepath\\test.jpg", files: [file] },
      };
      btn.dispatchEvent(new Event("change"))
      newBill.handleChangeFile(event)
      // console.log('Nom du fichier :', btn.files[0].name)
      // console.log('Type MIME :', btn.files[0].type)
      // console.log('Taille du fichier :', btn.files[0].size, 'octets')
  
      // expect(handleChangeFileFn).toHaveBeenCalledTimes(1)
      // expect(typeof btn.files[0]).toBe('object')
      // expect(btn.files.length).toBe(1)
      // expect(btn.files[0]).toBe(file)
      // await waitFor(() => expect(btn.files[0]).name.toBe("test.jpg"))
      expect(errorMessage).toHaveClass("hidden");
    })

    test("Proof : test unallowed upload type files !== JPG, JPEG, PNG", async () => {
      const newBill = new NewBill(context);
      const btn = screen.getByTestId("file");
      const errorMessage = screen.getByTestId("file-error-message");
      // const handleChangeFileFn = spyOn(newBill, "handleChangeFile")

      const file = new File([""], "test.txt", { type: "text/plain" });// [content], name, type MIME
      const event = {
        preventDefault: jest.fn(),
        target: { value: "C:\\fakepath\\test.txt", files: [file] },
      };
      btn.dispatchEvent(new Event("change"))
      newBill.handleChangeFile(event)
      // console.log('Nom du fichier :', btn.files[0].name)
      // console.log('Type MIME :', btn.files[0].type)
      // console.log('Taille du fichier :', btn.files[0].size, 'octets')
  
      // expect(handleChangeFileFn).toHaveBeenCalledTimes(1)
      // expect(typeof btn.files[0]).toBe('object')
      // expect(btn.files.length).toBe(1)
      // expect(btn.files[0]).toBe(file)
      // await waitFor(() => expect(btn.files[0]).name.toBe("test.jpg"))
      expect(errorMessage).not.toHaveClass("hidden");
    })

    // //TODO
    // test('should log an error when an exception is thrown', () => {
    

    // });
      
      
      
      
      
      // const handleChangeFileFn = jest.spyOn(newBill, "handleChangeFile")
      
      // const goodFile = new File(['toto'], 'toto.jpg', { type: 'image/jpg' })
      
      // // const toto = await waitFor(() => screen.getByText('Justificatif'))
      // // expect(toto).toBeInTheDocument()
      
      // const fileErrorMessage = await waitFor(() => screen.getByTestId('file-error-message'))
      // expect(fileErrorMessage).toHaveClass('hidden')
      
      
      // // const handleChangeFileFn = jest.fn((e) => (newBill.handleChangeFile(e)))
      // // btn.addEventListener('change', (e) => { console.log('<<<<<<Event-Log>>>>>>'); return newBill.handleChangeFile(e) })
      
      // btn.addEventListener('change',  handleChangeFileFn)
      
      
      // console.log('apres >>>>>>>> Event Log')
      // userEvent.upload(btn, goodFile)
      
      // console.log('Nom du fichier :', btn.files[0].name);
      // console.log('Type MIME :', btn.files[0].type);
      // console.log('Taille du fichier :', btn.files[0].size, 'octets');
      // expect(btn.files[0].name).toBe("toto.jpg");
      
      // expect(handleChangeFileFn).toHaveBeenCalledTimes(1)
      // // expect(newBill.handleChangeFile).toHaveBeenCalledTimes(1)
      // // expect(btn.files[0]).toBe(goodFile)
      // // expect(btn.files.length).toBe(1)
      // // expect(btn.files[0].name).toBe(goodFile.name)
      // // expect(typeof btn.files[0]).toBe('object')
      // expect(fileErrorMessage).toHaveClass('hidden')
      
      // btn.removeEventListener('change', handleChangeFileFn )
    // })
    

    // TODO  wrong file 
    // test("Proof : test unallowed upload type files !== JPG, JPEG, PNG", async () => {
    //   const newBill = new NewBill(context)
    //   const btn = await waitFor(() => screen.getByTestId("file"))
    //   const fileErrorMessage = await waitFor(() => screen.getByTestId('file-error-message'))
    //   expect(fileErrorMessage).toHaveClass('hidden')
    
    //   const wrongFile = new File(['toto'], 'toto.txt', { type: 'text/plain' })
    //   const handleChangeFileFn = jest.fn((e) => (newBill.handleChangeFile(e)))
    //   btn.addEventListener('change', handleChangeFileFn)
    //   userEvent.upload(btn, wrongFile)
      
    //   expect(handleChangeFileFn).toHaveBeenCalledTimes(1)
    //   expect(btn.files[0]).toBe(wrongFile)
    //   expect(btn.files.length).toBe(1)
    //   expect(btn.files[0].name).toBe(wrongFile.name)
    //   expect(typeof btn.files[0]).toBe('object')
    //   await waitFor (() => expect(fileErrorMessage).not.toHaveClass('hidden'))

    //   btn.removeEventListener('change', handleChangeFileFn )
    // })
  


    test("the bouton -choisir un fichier- type = file", () => {
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
        const spyOnNavigate = jest.spyOn(bill, 'onNavigate')
        const spyUpdateBill = jest.spyOn(bill, 'updateBill')
        
        form.addEventListener('submit', spyHandleSubmit)
        userEvent.click(submitBtn
        expect(spyHandleSubmit).toHaveBeenCalledTimes(1)
        expect(spyUpdateBill).toHaveBeenCalledTimes(2) // TODO why "2 call"
        expect(spyOnNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])// TODO why "2 call"
        form.removeEventListener('submit', spyHandleSubmit)
        
        // check if user is redirected to bills page after submit
        const billsPage = await waitFor(() => screen.getAllByTestId('employee-bills-page'))
        expect(billsPage).toHaveLength(1)
        spyUpdateBill.mockRestore();
        spyOnNavigate.mockRestore();
      })
    }) 
  })
})

