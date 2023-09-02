/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'; // for toHaveAttribute()
import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import userEvent from '@testing-library/user-event';


let context;
let instance;

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

  //   context = {
  //     document: document, // simule les interactions DOM
  //     onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) }, // simule la navigation en prenant un chemin "path" et modifie le contenu de la page
  //     store : null, // objet simulé, agit comme un magasin de données
  //     localStorage: window.localStorage,
  //   }
  //   beforeEach (()=>{
  //     onNavigate = context.onNavigate
  //     instance = new NewBill(context)
  //     document.body.innerHTML = NewBillUI()
  //     context.localStorage
  //  })
    // afterEach (()=> {
    //  onNavigate = null
    //  instance =  null 
    //  document.body.innerHTML = null
    //  context.localStorage.clear()
  //    jest.restoreAllMocks()
  //  })
    
    test("Then newBill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')

      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    test("Then when le bouton -choisir un fichier- est bien de type file et required", () => {
      // const html = NewBillUI()
      document.body.innerHTML = NewBillUI()
      const input = screen.getByTestId("file");
      expect(input).toHaveAttribute('type', 'file')
      expect(input.required).toBe(true)
    })

    test("handleChangeFile is call when the btn new bill is click", () => {
      context = {
        document: document, // simule les interactions DOM
        onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) }, // simule la navigation en prenant un chemin "path" et modifie le contenu de la page
        store : null, // objet simulé, agit comme un magasin de données
        localStorage: window.localStorage,
      } 

      onNavigate = context.onNavigate
      instance = new NewBill(context)
      document.body.innerHTML = NewBillUI()
      context.localStorage

      const btn =screen.getByTestId("file")
      const handleChangeFileFn = jest.fn((e) => (instance.handleChangeFile(e)))
      btn.addEventListener('click', handleChangeFileFn)
      userEvent.click(btn)
      expect(handleChangeFileFn).toHaveBeenCalledTimes(1)
    })

    test("JPG", () => {
      context = {
        document: document, // simule les interactions DOM
        onNavigate: path => { document.body.innerHTML = ROUTES({ pathname:path, data: [] }) }, // simule la navigation en prenant un chemin "path" et modifie le contenu de la page
        store : null, // objet simulé, agit comme un magasin de données
        localStorage: window.localStorage,
      } 

      onNavigate = context.onNavigate
      instance = new NewBill(context)
      document.body.innerHTML = NewBillUI()
      context.localStorage

      const btn = screen.getByTestId("file")
      const wrongFile = new File(['toto'], 'toto.txt', { type: 'text/plain' })
      const handleChangeFileFn = jest.fn((e) => (instance.handleChangeFile(e)))
      btn.addEventListener('click', handleChangeFileFn)
      userEvent.upload(btn, wrongFile)
      const errorDiv = screen.getByText("Extension de fichier non valide. Sélectionner un fichier JPG, JPEG ou PNG")
      // const error = document.querySelector("#file-error")
     
      expect(btn.files[0]).toStrictEqual(wrongFile)
      expect(errorDiv).toBeInTheDocument();
      // expect ($('#file-error').css('display')).toBe('block')
      // expect(error.style.display).toBe('block')
    })
  })
})






// tester POST handleSubmit
// quand je clique sur envoyé je reviens sur la page bills
// Uncovered lines 38-56,59-76,81-88