const mysql = require('mysql');
const inquirer = require('inquirer');

const utils = require('./utils')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'tucker10',
    database: 'employeesDB'
})


let departments;

let roles;

let employees;

let allNames = {
    employee: [],
    role: [],
    department: []
}

const search = (array,property,value) => {
    array.forEach(it => {
        if(it[property] == value){
            return it
        }
    })
}

const init = () => {


    connection.query(
        'SELECT * FROM department',
        (err,res) => {
            if(err) throw err;
            departments = res
            departments.forEach(i => {
                allNames.department.push(i.name)
            })
        }
    )

    connection.query(
        'SELECT * FROM role',
        (err,res) => {
            if(err) throw err;
            roles = res
            roles.forEach(i => {
                allNames.role.push(i.title)
            })
        }
    )

    connection.query(
        'SELECT * FROM employee',
        (err,res) => {
            if(err) throw err;
            employees = res
            employees.forEach(i => {
                allNames.employee.push(`${i.last_name}`)
            })
        }
    )



    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Please select an option',
                choices: [
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'View a department',
                    'View a role',
                    'View an employee',
                    'Update an employees role',
                    'Exit'
                ]
            }
        ])
        .then((data)=> {
            if (data.action == 'Add a department') {
                addDepartment()
            } else if (data.action == 'Add a role'){
                addRole()
            } else if (data.action == 'Add an employee'){
                addEmployee()
            } else if (data.action == 'View a department'){
                view('department')
            } else if (data.action == 'View a role'){
                view('role')
            } else if (data.action == 'View an employee'){
                view('employee')
            }  else if (data.action == 'Update an employees role'){
                updateRole()
            } else if (data.action == 'Exit'){
                return;
            }
        })
}

const addDepartment = () => {
    inquirer 
        .prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is this departments name?'
            }
        ])
        .then((data) => {
            const query = connection.query(
                'INSERT INTO department SET ?',
                {
                    name: data.name
                },
                (err,res) => {
                    if (err) throw err;
                    console.log('\x1b[32m%s\x1b[0m', 'Department successfully added.');
                    connection.end();
                }
            )
        })
        .then(() => askContinue())
}

const addRole = async () => {


    inquirer
        .prompt([
            {
                type: 'input',
                name: 'title',
                message: `Input role's title`
            },
            {
                type: 'input',
                name: 'salary',
                message: `Input role's salary`
            },
            {
                type: 'list',
                name: 'department',
                message: `Choose role's department`,
                choices: allNames.department
            }
        ])
        .then((data) => {
            let departmentId;
            departments.forEach(department => {
                if(data.department == department.name){
                    departmentId = department.id;
                }
            })
            console.log(departmentId)
            const query = connection.query(
                'INSERT INTO role SET ?',
                {
                    title: data.title,
                    salary: data.salary,
                    department_id: departmentId
                },
                (err,res) => {
                    if (err) throw err;
                    console.log('\x1b[32m%s\x1b[0m', 'Role successfully added.');

                }
            )
        })
        .then(() => askContinue());
}


const addEmployee = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'first_name',
                message: `Input employee's first name`
            },
            {
                type: 'input',
                name: 'last_name',
                message: `Input employee's last name`
            },
            {
                type: 'input',
                name: 'manager_id',
                message: `Input this employee's manager's id`
            },
            {
                type: 'list',
                name: 'role',
                message: `Select employees role`,
                choices: allNames.role
            },
        ])
        .then((data) => {
            let roleId;
            roles.forEach(role => {
                if(data.role == role.title){
                    roleId = role.id;
                }
            })

            console.log(roleId);

            const query = connection.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    role_id: roleId,
                    manager_id: data.manager_id
                },
                (err,res) => {
                    if (err) throw err;
                    console.log('\x1b[32m%s\x1b[0m', 'Employee successfully added.');

                }
            )
        })
        .then(() => askContinue())
}


const updateRole = () => {
    inquirer   
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which employee would you like to update?',
                choices: allNames.employee
            },
            {
                type: 'list',
                name: 'role',
                message: 'What would you like their role to be',
                choices: allNames.role
            }
        ])
        .then((data) => {
            let employeeId;
            employees.forEach(employee => {
                if(data.employee == employee.last_name){
                    employeeId = employee.id;
                }
            })

            let roleId;
            roles.forEach(role => {
                if(data.role == role.title){
                    roleId = role.id;
                }
            })

            connection.query(
                'UPDATE employee SET ? WHERE ?',
                [
                    {
                        role_id: roleId
                    },
                    {
                        id: employeeId
                    }
                ],
                (err,res) => {
                    if (err) throw err;
                    console.log('\x1b[32m%s\x1b[0m', 'Employee role updated.')
                }
            )
        })
        .then(() => askContinue());
}

const view = (target) => {

    console.log('below')
    let searched = search(employees,'first_name','Dude')


    inquirer
        .prompt([
            {
                type: 'list',
                name: 'selected',
                message: `Please select which ${target} you would like to view`,
                choices: allNames[target]
            }
        ])
        .then((data) => {

            let allInstances;
            let nameOrTitle;
            if(target == 'department'){
                allInstances = departments
                nameOrTitle = 'name'
            } else if (target == 'role'){
                allInstances = roles
                nameOrTitle = 'title'
            } else {
                allInstances = employees
                nameOrTitle = 'last_name'
            }

            let instanceData;

            allInstances.forEach(i => {
                if(i[nameOrTitle] == data.selected){
                    instanceData = i
                }
            })
        })
    // connection.query(
    //     `SELECT * FROM ${target} WHERE ?`,
    //     {
    //         id: id
    //     },
    //     (err,res) => {
    //         if(err) throw err;
    //         console.log(res)
    //     }
    // )
}






const askContinue = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Would you like to continue?',
                choices: ['continue','exit']
            }
        ])
        .then((data) => {
            if(data.action == 'continue'){
                init()
            } else {
                return;
            }
        })
}





connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`)

    init()
})

module.exports = { connection }