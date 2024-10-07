import { useMutation, useQuery} from "@apollo/client"
import { useState } from "react"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBornTo] = useState('')

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS } ]
  })
  
  const authors = useQuery(ALL_AUTHORS)

  if (!props.show) {
    return null
  }
  

  if (authors.loading)  {
    return <div>loading...</div>
  }

  const submit = async (event) => {
    event.preventDefault()
    const bornInt = parseInt(born)

    editAuthor({ variables: { name, setBornTo: bornInt } })

    setName('')
    setBornTo('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <select value={name} onChange={({ target }) => setName(target.value)}>
          <option value="" disabled>
            Select an author
          </option>
            {authors.data.allAuthors.map((author) => (
              <option key={author.name} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBornTo(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
