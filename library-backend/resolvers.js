const { GraphQLError, graphql, subscribe } = require('graphql')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()

const resolvers = {
    
    Query: {
      bookCount: async () => Book.collection.countDocuments(),
      authorCount: async () => Author.collection.countDocuments(),
      allBooks: async (root, args) => {
        if (args.genre) {
          return Book.find({ genres: args.genre }).populate('author')
        }
        return Book.find({}).populate('author')
      },
      allAuthors: async (root, args) => {
        return Author.find({})
      },
      me: (root, args, context) => {
        return context.currentUser
      }
    },
    
    Author: {
      bookCount: async (author) => {
        const byAuthor = await Book.find({ author: author._id })
        return byAuthor.length
      }
    },
   
    Mutation: {
      addBook: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })
        }
  
        let author = await Author.findOne({ name: args.author })
    
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }
    
        const book = new Book({ 
          title: args.title,
          published: args.published,
          author: author._id,
          genres: args.genres
        })
  
        try {
          await book.save()
        } catch (error) {
          throw new GraphQLError('Saving book failed', {
            extensions: {            
              code: 'BAD_USER_INPUT',            
              invalidArgs: args.author,            
              error
            }
          })
        }
        
        pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') })
  
        return book.populate('author')
      },
  
      editAuthor: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })
        }
  
        const author = await Author.findOne({ name: args.name })
        author.born = args.setBornTo
        try {        
          await author.save()    
        } catch (error) {        
          throw new GraphQLError('Saving author failed', {
            extensions: {            
              code: 'BAD_USER_INPUT',            
              invalidArgs: args.name,            
              error          
            }        
          })      
        }
  
        return author
      },
  
      createUser: async (root, args) => {
        const user = new User({ 
          username: args.username,
          favoriteGenre: args.favoriteGenre
         })
  
        return user.save()
          .catch(error => {
            throw new GraphQLError('Creating the user failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.username,
                error
              }
            })
          })
      },
  
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
  
        if ( !user || args.password !== 'salasana' ) {
          throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })
        }
  
        const userForToken = {
          username: user.username,
          id: user._id
        }
  
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
        subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
}

module.exports = resolvers