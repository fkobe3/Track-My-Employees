// Import and require mysql2
const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table");

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "",
    database: "employees",
  },
  console.log(`Connected to the employee database.`)
);

function deleteEmployee() {
  db.query("SELECT * FROM employee", function (err, results) {
    const choices = results.map(({ id, first_name, last_name }) => {
      return {
        name: `${first_name} ${last_name}`,
        value: id,
      };
    });

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee would you like to remove?",
          choices: choices,
        },
      ])
      .then(({ employeeId }) => {
        db.query(
          `DELETE FROM employee WHERE id = ?`,
          employeeId,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log(result);
            showOptions();
          }
        );
      });
  });
}

// Query database
function showEmployees() {
  db.query("SELECT * FROM employee", function (err, results) {
    console.table(results);
    showOptions();
  });
}

function showOptions() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["View All Employees", "Remove Employee", "Quit"],
      },
    ])
    .then(({ choice }) => {
      switch (choice) {
        case "View All Employees":
          showEmployees();
          break;
        case "Remove Employee":
          deleteEmployee();
          break;
        default:
          process.exit();
      }
    });
}

showOptions();
