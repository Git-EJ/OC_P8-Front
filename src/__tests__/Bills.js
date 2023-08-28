/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      // const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
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
      console.log("DATES !!!!!!!!", dates)
      console.log("FORMAT-DATES !!!!!!!!", formatDates)
      console.log("DATES-SORTED !!!!!!!!", datesSorted)
      expect(formatDates).toEqual(datesSorted)
    })
  })
})



