const inquirer = require('inquirer');
const mysql = require('mysql2');
require('console.table');

let departmentsArray = [];
let managersArray = [];
let rolesArray = [];
let employeesArray = [];

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3001,
    user: 'root',
    password: 'Biodragon!7',
    database: 'company'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected as id' + connection.threadId);
    startMenu();
})

const startMenu = () => {
    inquirer
    .prompt ([
        {
            type: 'list',
            name: 'task',
            message: 'What is it that you need to do?',
            choices: [
                'View Departments',
                'View Roles',
                'View Employees',
                'View Employees Within a Department',
                'View Employees Under a Manager',
                new inquirer.Separator(),
                'Add Department',
                'Add Role',
                'Add Employee',
                new inquirer.Separator(),
                'Update Role of Employee',
                'Update Manager of Employee',
                new inquirer.Separator(),
                'End Application Session',
            ],
        }
    ]).then(startTask => {
        switch (startTask.task) {
            case 'View Departments':
                viewDept();
                break;
            case 'View Roles':
                viewRole();
                break;
            case 'View Employees':
                viewEmployee();
                break;
            case 'View Employees Within a Department':
                getDept();
                setTimeout(viewEmpbyDept,500);
                break;
            case 'View Employees Under a Manager':
                getManager();
                setTimeout(viewEmpbyMngr,500);
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                getRole();
                getManager();
                setTimeout(addEmployee,500);
                break;
            case 'Update Role of Employee':
                getEmployee();
                getRole();
                setTimeout(updateEmployee,500);
                break;
            case 'Update Manager of Employee':
                getEmployee();
                getManager();
                setTimeout(updateMngr,500);
                break;
            case 'End Application Session':
                end();
                break;
        }
    })
};

const viewDept = () => {
    connection.query(`SELECT id AS 'ID', deptName AS Department FROM departments`,
    function(err, results, fields) {
        if (err) throw err;
        console.log ('\n','--Company Departments--');
        console.table(results)
        startMenu();
    })
};