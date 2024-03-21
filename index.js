const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');

const schema = fs.readFileSync('./schema.graphql', 'utf8');

const authors = [
    { id: '1', nombre: 'J.K. Rowling', nacionalidad: 'British' },
    { id: '2', nombre: 'J.R.R. Tolkien', nacionalidad: 'British' },
    { id: '3', nombre: 'George Orwell', nacionalidad: 'British' },
    { id: '4', nombre: 'Gabriel García Márquez', nacionalidad: 'Colombian' },
    { id: '5', nombre: 'Miguel de Cervantes', nacionalidad: 'Spanish' },
];

const books = [
    { id: '1', titulo: 'Cien años de soledad', autor: '1', ISBN: '978-84-204-3076-1', aPublicacion: 1967 },
    { id: '2', titulo: 'Don Quijote de la Mancha', autor: '2', ISBN: '978-84-376-0494-4', aPublicacion: 1605 },
    { id: '3', titulo: 'Orgullo y prejuicio', autor: '3', ISBN: '978-84-15579-77-9', aPublicacion: 1813 },
    { id: '4', titulo: 'Moby Dick', autor: '4', ISBN: '978-84-376-0742-6', aPublicacion: 1851 },
    { id: '5', titulo: 'Crime and Punishment', autor: '5', ISBN: '978-84-9666-282-7', aPublicacion: 1866 },
];

const loans = [
    { id: '1', libro: '1', usuario: 'Carlos García', fechaPrestamo: '2024-01-10', fechaDevolucion: '2024-01-15' },
    { id: '2', libro: '2', usuario: 'Luisa Hernández', fechaPrestamo: '2024-02-10', fechaDevolucion: '2024-02-15' },
    { id: '3', libro: '3', usuario: 'Javier Sánchez', fechaPrestamo: '2024-03-10', fechaDevolucion: '2024-03-15' },
    { id: '4', libro: '4', usuario: 'Elena Martínez', fechaPrestamo: '2024-03-12', fechaDevolucion: '2024-03-13' },
    { id: '5', libro: '5', usuario: 'María López', fechaPrestamo: '2024-03-20', fechaDevolucion: '' },
];

const resolvers = {
    Query: {
        allBooks: () => {
            return books.map(book => ({
                id: book.id,
                titulo: book.titulo,
                autor: JSON.parse(JSON.stringify(authors.find(author => author.id === book.autor))),
                ISBN: book.ISBN,
                aPublicacion: book.aPublicacion
            }));
        },
        bookById: (root, args) => {
            // Encontrar el libro
            const book = JSON.parse(JSON.stringify(books.find(book => book.id === args.id)));

            // Encontrar el autor
            const author = JSON.parse(JSON.stringify(authors.find(author => author.id === book.autor)));

            // Retornar el libro con el autor
            return {
                id: book.id,
                titulo: book.titulo,
                autor: author,
                ISBN: book.ISBN,
                aPublicacion: book.aPublicacion
            }
        },
        allAuthors: () => {
            return authors
        },
        activeLoans: () => {

            // Crear una copia de los préstamos
            let activeLoans = JSON.parse(JSON.stringify(loans));

            // Recuperar solo los prestamos activos
            activeLoans = JSON.parse(JSON.stringify(activeLoans.filter(loan => loan.fechaDevolucion === '')));

            // Reemplazar el id del libro por el objeto libro
            activeLoans.forEach(loan => {
                loan.libro = JSON.parse(JSON.stringify(books.find(book => book.id === loan.libro)));
            });

            // Ahora reemplazar el autor del libro por el objeto autor
            activeLoans.forEach(loan => {
                loan.libro.autor = JSON.parse(JSON.stringify(authors.find(author => author.id === loan.libro.autor)));
            });

            return activeLoans;
        }
    },
    Mutation: {
        createBook: (root, args) => {

            if (!args.titulo || !args.autor || !args.ISBN || !args.aPublicacion) return ('Faltan datos');

            if (!args.aPublicacion.toString().match(/^[0-9]{4}$/)) return ('El año de publicación debe ser un número de 4 dígitos');

            if (!args.autor.match(/^[0-9]+$/)) return ('El autor debe ser un número positivo');

            if (!authors.find(author => author.id === args.autor)) return ('El autor no existe');

            // Crear un nuevo libro
            const newBook = {
                id: (books.length + 1).toString(),
                titulo: args.titulo,
                autor: args.autor,
                ISBN: args.ISBN,
                aPublicacion: args.aPublicacion
            };

            // Agregar el libro al array de libros
            books.push(newBook);

            // Retornar el nuevo libro
            return 'Libro creado con éxito!'
        },
        createAuthor: (root, args) => {

            if (args.nombre === '' || args.nacionalidad === '') return 'Faltan datos';

            if (authors.find(author => author.nombre === args.nombre)) return 'El autor ya existe';

            // Crear un nuevo autor
            const newAuthor = {
                id: (authors.length + 1).toString(),
                nombre: args.nombre,
                nacionalidad: args.nacionalidad
            };

            // Agregar el autor al array de autores
            authors.push(newAuthor);

            // Retornar el nuevo autor
            return 'Autor creado con éxito!'
        },
        createLoan: (root, args) => {

            if (!args.libro || !args.usuario) return 'Faltan datos';

            // Crear un nuevo préstamo
            const newLoan = {
                id: (loans.length + 1).toString(),
                libro: args.libro,
                usuario: args.usuario,
                fechaPrestamo: Date.now().toString(),
                fechaDevolucion: ''
            };

            // Agregar el préstamo al array de préstamos
            loans.push(newLoan);

            // Retornar el nuevo préstamo
            return 'Préstamo creado con éxito!'
        }
    }
}

const server = new ApolloServer({
    typeDefs: gql(schema),
    resolvers,
});

server.listen().then(({ url }) => {
    console.log(`Servidor corriendo en ${url}`);
});