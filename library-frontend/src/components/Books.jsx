import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { useState } from "react"

const Books = (props) => {
  if (!props.show) {
    return null
  }

  const [genre, setGenre] = useState(null)
  const books = useQuery(ALL_BOOKS, {
    variables: { genre: genre }
  })

  if (books.loading)  {
    return <div>loading...</div>
  }

  const genres = [...new Set(books.data.allBooks.flatMap(book => book.genres))]

  const filteredBooks = genre ? books.data.allBooks.filter(book => book.genres.includes(genre)) : books.data.allBooks

  return (
    <div>
      <h2>books</h2>
      in genre <b>{genre ? genre : "all genres"}</b>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map(genre => (
          <button key={genre} onClick={() => setGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </div>

    </div>
  )
}

export default Books
