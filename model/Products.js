import { connection as db} from '../config/index.js'

class Products {
    fetchProducts(req, res) {
        try {
            const strQry = `SELECT productID, prodName, category, prodDescription, prodURL, amount
            FROM Products;`
    
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

    fetchProducts(req, res) {
        router.get('/products/:id', (req, res) => {
            try{
                const stryQry = `
                SELECT productID, prodName, category, prodDescription, prodURL, amount
                FROM Products WHERE productID = ${req.params.id};`
                db.query(stryQry, (err, result) => {
                    if(err) throw new Error('Issue when retrieving a user.')
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

    async addProduct(req, res) {
        try {
            let data = req.body
             
            let strQry = `
            INSERT INTO Products
            SET ? ;   
            `  // or you can use this VALUES (?, ? , ?, ?)
            db.query(strQry, [data], (err) =>{
                if(err) {
                    res.json({
                        status: res.statusCode,
                        msg: 'Could not add product.'
                    })
                } else{
                    const token = createToken(user)
                    res.json({
                        token,
                        msg: 'You have successfully added a new product'
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
    
    async updateProduct(req, res) {
        try {
            let data = req.body

            const strQry = `
            UPDATE Products
            SET ?
            WHERE productID = ${req.params.id}
            `  
            db.query (strQry, [data], (err) => {
                if (err) throw new Error ('Unable to update a product')
                    res.json({
                        status: res.statusCode,
                        msg: 'The product record was updated.'
                })
            })
        } catch(e) {
            res.json({
                status: 400,
                msg: e.message //The error message from the if statement
        })
        }
    }

    deleteProduct(req, res) {
        try{
            const strQry = `
            DELETE FROM Products
            WHERE productID = ${req.params.id};
            `
            db.query (strQry, (err) => {
                if(err) throw new Error('To delete a product, please review your delete query.')
                    res.json({
                        status: res.statusCode,
                        msg: 'A product\'s information was removed'
                })
            })
        } catch(e) {
            res.json({
                status: 404, //Resource not found
                msg: e.message
            })
        }
    }
 }

 export {
    Products
 }