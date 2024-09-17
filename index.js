import express from 'express'
import path from 'path'
import { connection as db} from './config/index.js'
import { createToken } from './middleware/AuthenticateCustomer.js'
import { hash, compare } from 'bcrypt'
import bodyParser from 'body-parser'

//Create an express app 
const app = express()
const port = +process.env.PORT || 3000
const router = express.Router()

//Middleware
app.use(router , express.static('./static'),
 express.json(), 
 express.urlencoded({
    extended:true
})
)

router.use(bodyParser.json()), //to not call bodyParser on each and every endpoint, register once using 'router.use' // the body parser is used to pass the body as json. when you sending data from the database you need to have a pipeline body parser is that pipeline // when the user sends a request you need to have a body parser.

//Endpoint // the get endpoint allows you to retrieve something
router.get('^/$|/library', (req, res) => {
    res.status(200).sendFile(path.resolve('./static/html/index.html'))
})


router.get('/customers', (req, res) => {
    try {
        const strQry = `SELECT custID, custName, custSurname, custEmail, custPhoneNum, custAdd
        FROM Customers;`

        db.query(strQry, (err, results) => {
            if (err) throw new Error(err)
            res.json({
                status: res.statusCode,
                results
            })
        })
    }
     catch(e){
        res.json({
            status: 404,
            msg: e.message
        })
    }
})

//THIS DISPLAYS DATA ACCORDING TO ITS ID
router.get('/customers/:id', (req, res) => {
    try{
        const stryQry = `
        SELECT custID, custName, custSurname, custEmail, custPhoneNum, custAdd
        FROM Customers WHERE custID = ${req.params.id};`
        db.query(stryQry, (err, result) => {
            if(err) throw new Error('Issue when retrieving a Customer.')
                res.json({
               status: res.statusCode,
               result: result[0]
            })
        })
    } catch (e) {
        res.json({
            status: 404,
            msg:e.message
        })
    }
})

//post is more secure than get
// router.post('/register', async (req, res) => {
//     try {
//         let data = req.body
       
//         data.custEmail = await hash(data.custEmail, 12 )  //if the salt is bigger than 15 characters it will take long to encrypt & decrypt
//         //Payload
//         let customer = {
//             custEmail: data.custEmail,
//             custName: data.custName
//         }
//         let strQry = `
//         INSERT INTO Customers
//         SET ? ;   
//         `  // or you can use this VALUES (?, ? , ?, ?)
//         db.query(strQry, [data], (err) =>{
//             if(err) {
//                 res.json({
//                     status: res.statusCode,
//                     msg: (err)
//                 })
//             } else{
//                 const token = createToken(customer)
//                 res.json({
//                     token,
//                     msg: 'You are now registered'
//                 })
//             }
//         })
//     } catch(e) {
//         res.json({
//             status: 400, // Mistake on the clients side (Maybe syntax error)
//             msg: e.message //The error message from the if statement
//     })
//     }
//     }
// )

//put - everytime you send a request to update you send a new request. Thats why you use patch so that you can work with the same request when updating.
router.patch('/customer/:id', async (req, res) => {
    try {
        let data = req.body
        if (data.custEmail) {
            data.custEmail = await hash (data.custEmail, 12)
        }
        const strQry = `
        UPDATE Customers
        SET ?
        WHERE custID = ${req.params.id}
        `  
        db.query (strQry, [data], (err) => {
            if (err) throw new Error ('Unable to update a customer')
                res.json({
                    status: res.statusCode,
                    msg: 'The customer record was updated.'
            })
        })
    } catch(e) {
        res.json({
            status: 400,
            msg: e.message //The error message from the if statement
    })
    }
})

router.delete('/customer/:id', (req, res) => {
    try{
        const strQry = `
        DELETE FROM Customers
        WHERE custID = ${req.params.id};
        `
        db.query (strQry, (err) => {
            if(err) throw new Error('To delete a customer, please review your delete query.')
                res.json({
                    status: res.statusCode,
                    msg: 'A customer\'s information was removed'
            })
        })
    } catch(e) {
        res.json({
            status: 404, //Resource not found
            msg: e.message
        })
    }
})

router.post('/login', (req, res) => {
    try{
        const { custName, custEmail } = req.body
        const strQry = `
        SELECT custID, custName, custSurname, custEmail, custPhoneNum, custAdd
        FROM Customers
        WHERE custEmail = '${custEmail}';
        `
        db.query(strQry, async (err, result) => {
            if(err) throw new Error ('To login, please review your query.')
            if (!result?.length){
                res.json(
                {
                    status: 401, // Unauthorized user
                    msg: 'You provided a wrong email.'
                }
            )
            } else{
                const isValidPass = await compare
                (custEmail, result[0].custEmail)
                if (isValidPass) {
                    const token = createToken({
                        custName, 
                        custEmail
                    })
                    res.json({
                        status: res.statusCode,
                        token,
                        result: result[0]
                    })
                } else {
                    res.json({
                        status: 401,
                        msg: 'Invalid password or you have not registered'
                    })
                }
            }
        } )
    } catch (e) {
        res.json({
            status: 404,
            msg: e.message
        })
    }
})

//If you looking for something that doesnt exist
router.get ('*', (req, res) => {
    res.json({
        status: 404,
        msg: 'Resource Not Found'
    })
})

//listen assigns a port number to a server
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
