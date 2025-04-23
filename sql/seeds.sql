DELETE FROM employee;
DELETE FROM role;
DELETE FROM department;

INSERT INTO department (name) VALUES 
('Engineering'),
('Finance'),
('Sales'),
('Human Resources');

INSERT INTO role (title, salary, department_id) VALUES 
('Software Engineer', 95000, 1),
('Accountant', 70000, 2),
('Sales Representative', 60000, 3),
('HR Manager', 80000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('Sal', 'Varela', 1, NULL),
('Bob', 'Smith', 2, NULL),
('Richard', 'Johnson', 3, 1),
('Greg', 'Velasquez', 4, NULL);