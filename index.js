import inquirer from 'inquirer';
import db from './db/index.js';

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Exit'
      ]
    }
  ]);

  switch (action) {
    case 'View All Departments':
      await viewDepartments();
      break;
    case 'View All Roles':
      await viewRoles();
      break;
    case 'View All Employees':
      await viewEmployees();
      break;
    case 'Add Department':
      await addDepartment();
      break;
    case 'Add Role':
      await addRole();
      break;
    case 'Add Employee':
      await addEmployee();
      break;
    case 'Update Employee Role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      process.exit();
  }

  mainMenu();
}

async function viewDepartments() {
    try {
      const res = await db.query('SELECT * FROM department');
      console.table(res.rows);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }

  async function viewRoles() {
    try {
      const res = await db.query(`
        SELECT role.id, role.title, department.name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id
      `);
      console.table(res.rows);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }

  async function viewEmployees() {
    try {
      const res = await db.query(`
        SELECT 
          e.id, 
          e.first_name, 
          e.last_name, 
          r.title AS role, 
          d.name AS department, 
          r.salary, 
          CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
      `);
      console.table(res.rows);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  }

  async function addDepartment() {
    const { name } = await inquirer.prompt([
      {
        name: 'name',
        message: 'Enter department name:',
      }
    ]);
  
    try {
      await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
      console.log(`Added "${name}" to departments.`);
    } catch (err) {
      console.error('Error adding department:', err);
    }
  }

  async function addRole() {
    const departments = await db.query('SELECT * FROM department');
    const choices = departments.rows.map(dep => ({
      name: dep.name,
      value: dep.id,
    }));
  
    const answers = await inquirer.prompt([
      { name: 'title', message: 'Enter role title:' },
      { name: 'salary', message: 'Enter role salary:' },
      {
        type: 'list',
        name: 'department_id',
        message: 'Select department:',
        choices,
      }
    ]);
  
    try {
      await db.query(
        'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
        [answers.title, answers.salary, answers.department_id]
      );
      console.log(`Added role "${answers.title}" successfully.`);
    } catch (err) {
      console.error('Error adding role:', err);
    }
  }

  async function addEmployee() {
    try {
      const roles = await db.query('SELECT * FROM role');
      const employees = await db.query('SELECT * FROM employee');
  
      const roleChoices = roles.rows.map(role => ({
        name: role.title,
        value: role.id
      }));
  
      const managerChoices = employees.rows.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }));
      managerChoices.unshift({ name: 'None', value: null });
  
      const answers = await inquirer.prompt([
        { name: 'first_name', message: 'Enter first name:' },
        { name: 'last_name', message: 'Enter last name:' },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select role:',
          choices: roleChoices
        },
        {
          type: 'list',
          name: 'manager_id',
          message: 'Select manager:',
          choices: managerChoices
        }
      ]);
  
      await db.query(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]
      );
  
      console.log(`Added ${answers.first_name} ${answers.last_name} to employees.`);
    } catch (err) {
      console.error('Error adding employee:', err);
    }
  }

  async function updateEmployeeRole() {
    try {
      const employees = await db.query('SELECT * FROM employee');
      const roles = await db.query('SELECT * FROM role');
  
      const employeeChoices = employees.rows.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }));
  
      const roleChoices = roles.rows.map(role => ({
        name: role.title,
        value: role.id
      }));
  
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: 'Select employee to update:',
          choices: employeeChoices
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select new role:',
          choices: roleChoices
        }
      ]);
  
      await db.query(
        'UPDATE employee SET role_id = $1 WHERE id = $2',
        [answers.role_id, answers.employee_id]
      );
  
      console.log(`Updated employee's role successfully.`);
    } catch (err) {
      console.error('Error updating role:', err);
    }
  }

  mainMenu();