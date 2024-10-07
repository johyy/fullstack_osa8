import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import Login from "./components/Login"
import { useApolloClient, useSubscription } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED } from "./queries"

export const updateCache = (cache, query, addedBook) => {
  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: allBooks.some(book => book.id === addedBook.id)
        ? allBooks
        : [...allBooks, addedBook],
    }
  })
}

const App = () => {
  const [page, setPage] = useState("books")
  const client = useApolloClient()
  const [token, setToken] = useState(null)

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      window.alert(`New book called "${addedBook.title}" added!`)

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)     
    }
  })

  const logout = () => {    
    setToken(null)    
    localStorage.clear()    
    client.resetStore() 
  }
  
  return (
    <div>
      <div>
        {token &&<button onClick={() => setPage("authors")}>authors</button>}
        <button onClick={() => setPage("books")}>books</button>
        {token &&<button onClick={() => setPage("add")}>add book</button>}
        {token ?(
          <button onClick={logout}>logout</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
        
      </div>

      {token && <Authors show={page === "authors"} />}

      <Books show={page === "books"} />

      {token && <NewBook show={page === "add"} />}

      {!token && page === "login" && (
        <Login setToken={setToken} />
      )}
    </div>
  )
}

export default App
