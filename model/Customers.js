import { connection as db} from '../config/index.js'
import { createToken } from '../middleware/AuthenticateCustomer.js'
import { hash, compare } from 'bcrypt'

class Customers {
    fetchCustomers(req, res) {
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
    }

    fetchCustomer(req, res) {
        router.get('/customers/:id', (req, res) => {
            try{
                const stryQry = `
                SELECT custID, custName, custSurname, custEmail, custPhoneNum, custAdd
                FROM Customers WHERE custID = ${req.params.id};`
                db.query(stryQry, (err, result) => {
                    if(err) throw new Error('Issue when retrieving a customer.')
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
    }

    async registerCustomer(req, res) {
        try {
            let data = req.body
           
            data.custEmail = await hash(data.custEmail, 12 )  //if the salt is bigger than 15 characters it will take long to encrypt & decrypt
            //Payload
            let customer = {
                custEmail: data.custEmail,
                custName: data.custName
            }
            let strQry = `
            INSERT INTO Customers
            SET ? ;   
            `  // or you can use this VALUES (?, ? , ?, ?)
            db.query(strQry, [data], (err) =>{
                if(err) {
                    res.json({
                        status: res.statusCode,
                        msg: 'This email has already been taken'
                    })
                } else{
                    const token = createToken(customer)
                    res.json({
                        token,
                        msg: 'You are now registered'
                    })
                }
            })
        } catch(e) {
            res.json({
                status: 400, // Mistake on the clients side (Maybe syntax error)
                msg: e.message //The error message from the if statement
        })
        }
    }
    
    async updateCustomer(req, res) {
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
    }

    deleteCustomer(req, res) {
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
    }

    async login(req, res) {
        try{
            const { custName, custEmail } = req.body
            const strQry = `
            SELECT custID, custName, custSurname, custEmail, custPhoneNum, custAdd
            FROM Customers
            WHERE custName = '${custName}';
            `
            db.query(strQry, async (err, result) => {
                if(err) throw new Error ('To login, please review your query.')
                if (!result?.length){
                    res.json(
                    {
                        status: 401, // Unauthorized customer
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
    }
 }

 export {
    Customers
 }