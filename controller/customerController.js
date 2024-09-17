import express from 'express'
import bodyParser from 'body-parser'
import { customers } from '../model/index.js'

const custRouter = express.Router()

custRouter.use(bodyParser.json())

custRouter.get('/', (req, res) => {
    customers.fetchCustomers(req, res)
})

custRouter.get ('/:id', (req, res) => {
    customers.fetchCustomer(req, res)
})

custRouter.post('/register', (req, res) => {
    customers.regiterCustomer(req, res)
})

custRouter.patch('/customer/:id', (req, res) => {
    customers.updateCustomer(req, res)
})

custRouter.delete('/customer/:id', (req, res) => {
    customers.deleteCustomer(req, res)
})

custRouter.post('/login', (req, res) => {
    customers.login(req, res)
})

export {
    express,
    custRouter
}