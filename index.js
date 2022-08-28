const inquirer = require('inquirer');
const mysql = require('mysql2');
require('console.table');

let departmentArray = [];
let managerArray = [];
let roleArray = [];
let employeeArray = [];

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
    connection.query(`SELECT id AS 'ID', deptName AS Department FROM department`,
    function(err, res) {
        if (err) throw err;
        console.log ('\n','--Company Departments--');
        console.table(res)
        startMenu();
    })
};

const viewRole = () => {
    let query = `SELECT .id AS 'ID', jobTitle AS 'Job Title', salary AS 'Salary', deptName AS ' Department Name'
    FROM role
    LEFT JOIN department
    ON role.dept_id = department.id;`

    connection.query (query,
        function (err, res) {
            if (err) throw err;
            console.log ('\n', '--Employee Role');
            console.table (res);
            startMenu ();
        })
        };

        const viewEmployee = () => {
            const query = `SELECT e.id AS 'ID', fName AS 'First Name', lName AS 'Last Name', jobTitle AS 'Job Title', salary as 'Salary', deptName AS 'Dept Name',
            (SELECT concat(fName,' ',lName) FROM employee as emp WHERE e.manager_id = emp.id) AS 'Manager'          
                FROM employee e
                LEFT JOIN role
                ON e.role_id = role.id
                LEFT JOIN department
                ON dept_id = department.id;`
            connection.query(query,
                function(err, res) {
                    if (err) throw err;
                    console.log('\n','-- Employees --')
                    console.table(res);
                    startMenu();
                })
        };

const  viewEmpbyDept = () => {
    inquirer
    .prompt ([
        {
            type: 'list',
            name: 'task',
            message: 'View Which Department?',
            choices: departmentArray.map (dept => dept.deptName),
        }
    ])
    .then(answer => {
        const query = `SELECT employee.id AS 'ID', fName AS 'First Name', lName AS 'Last Name', jobTitle AS 'Job Title', salary as 'Salary', deptName AS 'Dept Name'
        FROM employee
        LEFT JOIN role
        ON role_id = role.id
        LEFT JOIN department
        ON dept_id = department.id
        WHERE ?`
        connection.query(query, {
            deptName: answer.task,
        },
        function(err,res){
            if (err) throw err;
            console.log ('\n',`--Employees within ${answer.task} Department --`);
            console.table (res);
            startMenu ();
        });
    })
};

const viewEmpbyMngr = () => {
    inquirer
    .prompt ([
        {
            type: 'list',
            name: 'manager',
            message: 'View Which Manager?',
            choices: managerArray.map (manager => manager.name),
        }
    ])
    .then(answer => {
        let manId= managerArray.filter (manager => manager.name === answer.manager);
        const query = `SELECT e.id AS 'ID', fName AS 'First Name', lName AS 'Last Name', jobTitle AS 'Job Title', salary as 'Salary', deptName AS 'Dept Name',
        (SELECT concat(fName,' ',lName) FROM  as emp WHERE e.manager_id = emp.id) AS 'Manager'          
            FROM employee e
            LEFT JOIN role
            ON e.role_id = role.id
            LEFT JOIN department
            ON dept_id = department.id
            WHERE ?`;

            connection.query(query,
                {
                    manager_id: manId[0].id,
                },
                function (err, res) {
                    if (err) throw err;
                    console.log('\n', `--Employees with ${answer.manager} for Manager --`);
                    console.table (res);
                    startMenu();
                });
            })
        };
    
const addDept = () => {
    inquirer
    .prompt({
        name: 'deptName',
        type: 'input',
        message: 'Please enter the Department Name.',
    })
    .then(answer => {
        const query = connection.query ('INSERT INTO  department SET ?',
        {
            deptName: answer.deptName,
        },
        function (err, res) {
            if (err) throw err;
            console.log('\n', res.affectedRows + 'Deparment INSERTED', '\n');
            startMenu(); 
        });
    })
};

const addRole = () => {
    inquirer
    .prompt([
        {
            name: 'roleName',
            type: 'input',
            message: 'Please enter the Job(Role) Title.', 
        },
        {
            name: 'salary',
            type: 'input',
            message: 'Please enter the Salary of the job.', 
        },
        {
            name: 'roleDept',
            type: 'list',
            message: 'Please choose the department that this job belongs to.',
            choices: departmentArray.map(dept => dept.deptName),
        },
    ])
    .then(answer => {
        let deptId = departmentArray.filter (dept => dept.deptName === answer.roleDept);
        const query = connection.query ('INSERT INTO role SET ?',
        {
            jobTitle: answer.roleName,
            salary: answer.salary,
            dept_id: deptId[0].id,
        },
        function (err,res) {
            if (err) throw err;
            console.log ('\n', res.affectedRows + 'ROLE INSERTED', '\n');
            startMenu ();
    })

    })
};

const addEmployee = () => {
    inquirer
    .prompt ([
        {
            name: 'first_name',
            type: 'input',
            message: 'Please enter the first name of the Employee.',
        },
        {
            name: 'last_name',
            type: 'input',
            message: 'Please enter the last name of the Employee.',
        }, 
        {
            name: 'jobRole',
            type: 'list',
            message: 'Please enter the role of the Employee.',
            choices: roleArray.map (role => role.jobTitle),
        },
        {
            name: 'manager',
            type: 'list',
            message: 'Please enter the manager of the Employee.',
            choices: managerArray.map (manager => manager.name),
        },
    ])
    .then(answer => {
        let roleId = roleArray.filter (role => role.jobTitle === answer.jobRole);
        let managerId = managerArray.filter (manager => manager.name === answer.manager);

        const query = connection.query ('INSERT INTO employee SET ?',
        {
            firstName: answer.first_name,
            lastName: answer.last_name,
            role_id: roleId[0].id,
            manager_id: managerId[0].id,
        },
        function (err,res) {
            if (err) throw err;
            console.log ('\n', res.affectedRows + 'Employee INSERTED', '\n');
            startMenu();
        })
    })
};

const updateEmployee = () => {
    inquirer
    .prompt ([
        {
            name: 'employee_name',
            type: 'list',
            message: 'Please choose the employee to edit.',
            choices: employeeArray.map (employee => employee.name),
        },
        {
            name: 'employee_role',
            type: 'list',
            message: 'Please select the Role of the Employee.',
            choices: roleArray.map (role => role.jobTitle),
        },
    ])
    .then(answer => {
        let employeeId = employeeArray.filter (employee.name === answer.employee_name);
        let roleId = roleArray.filter (role => role.jobTitle === answer.employee_role);

        const query = connection.query ('UPDATE employee SET ? WHERE ?',
        [
            {
                role_id: roleId[0].id,
            },
            {
                id:employeeId[0],id,
            }
        ],
        function (err, res) {
            if (err) throw err;
            console.log ('\n', res.affectedRows + 'employee UPDATED', '\n');
            startMenu();
    });
});
};

const updateMngr = () => {
    inquirer
    .prompt ([
        {
            name: 'employee_name',
            type: 'list',
            message: 'Please choose the Employee to edit.',
            choices: managerArray.map (manager => manager.name),
        },
        {
            name: 'employee_mngr',
            type: 'list',
            message: 'Please select the Employee Manager.',
            choice: managerArray.map(manager => manager.name),
        },
    ])
    .then(answer => {
        let employeeId = employeeArray.filter (employee => employee.name === answer.employee_name);
        let managerId = managerArray.filter (manager => manager.name === answer.employee_mngr);

        const query = connection.query ('UPDATE employee SET ? WHERE ?',
        [
            {
                manager_id: manId[0].id,
            },
            {
                id: employeeId[0].id,
            }
        ],
        function (err,res) {
            if (err) throw err;
            console.log ('\n', res.affectedRows + 'employee UPDATED', '\n');
            startMenu();
    });
});
};

const getEmployee = () => {
    let query = `SELECT id, firstName, lastName
    FROM employee;`;
    connection.query(query, 
        function (err, res){
            if (err) throw err;
            res.forEach(employee => {
                employeeArray.push({id:employee.id, name: `${employee.firstName} ${employee.lastName}`});
            })
        });
        };

    const getManager = () => {
            const query = `SELECT employee.id as 'id', firstName, lastName, role_id, role.jobTitle 
                            FROM employee
                            LEFT JOIN role
                            ON employee.role_id = role.id
                            WHERE jobTitle LIKE '%Manager%';`;
            
            connection.query(query,
                function(err,res){
                    if (err) throw err;
        
                    res.forEach(employee => {
                        managerArray.push({id:employee.id, name:`${employee.fName} ${employee.lName}`, role_id:employee.role_id, jobTitle: employee.jobTitle});
                    })
                });
        };
    
    const getDept  = () => {
        const query = `SELECT * FROM department`;

        connection.query(query,
            function (err, res) {
                if (err) throw err;
                res.forEach(dept => {
                    departmentArray.push({id:dept.id, deptName:dept.deptName});
                })
            });
        };
    
    const getRole = () => {
        const query = `SELECT id, jobTitle FROM role`;
        connection.query(query,
            function (err, res) {
                if (err) throw err;
                res.forEach(role => {roleArray.push({id:role.id, jobTitle: role.jobTitle});
            })
        });
    };

    const end = () => {
        console.log ('Thank You, have a great day.');
        connection.end();
    };