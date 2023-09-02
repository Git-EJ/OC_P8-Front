import bills from "./store.js"

export async function mockStore() {
  try {
    const toto = await bills.bills().list()
    return toto
  }
  catch {
    console.error("bills error frome store.js")
  }
}
