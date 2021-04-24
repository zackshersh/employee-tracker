const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'tucker10',
    database: 'employeesDB'
})

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`)
})