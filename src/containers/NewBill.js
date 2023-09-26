import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  
  handleChangeFile = e => {
    e.preventDefault()
    const input = this.document.querySelector(`input[data-testid="file"]`)
    const file = input.files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1] 
    const fileNameSplit = fileName.split('.')
    const fileNameExtension = fileNameSplit[fileNameSplit.length-1]
    const isValidFileNameExtension = ['jpg', 'jpeg', 'png']
    const errorMessage = this.document.querySelector(".new-bill_input-file_extension-error-message")


    if (!isValidFileNameExtension.includes(fileNameExtension)) {
      input.value = null
      errorMessage.classList.remove('hidden')
      return
    } 
    errorMessage.classList.add('hidden')
  

    const formData = new FormData() // créer un objet formData avec paires key/value
    const email = JSON.parse(localStorage.getItem("user")).email 

    formData.append('file', file) //.append ajoute à l'objet formData key/value
    formData.append('email', email)

    this.store 
      .bills() 
      .create({ 
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        this.billId = key  
        this.fileUrl = fileUrl
        this.fileName = fileName
      })
      .catch(error => {
        console.error('===================CATCH handleChangeFile====================', error)
        this.onNavigate(ROUTES_PATH['Error404'], error);
      })
  }
  handleSubmit = async(e) => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    
    const error = await this.updateBill(bill)
    if (!error) {
      this.onNavigate(ROUTES_PATH['Bills'])
    } else {
      console.error('===================CATCH handleSubmit====================', error)
      this.onNavigate(ROUTES_PATH['Error500'], error.error);
    }
  }

  // not need to cover this function by tests
  updateBill = async (bill) => {

    return (this.store && this.store
    .bills()
    .update({data: JSON.stringify(bill), selector: this.billId})
    .then(() => {
      return undefined
    })
    .catch(error => {
      console.error('===================CATCH updateBill====================', error)

      return {error:error}
    }))
  }
}
