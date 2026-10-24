// Task1: initiate app and run server at 3000

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Keep the supplied static path and also serve the actual provided folder name.
const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// Task2: create mongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('Missing MONGODB_URI. Add your MongoDB Atlas connection string to a .env file.');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => {
        console.error('Could not connect to MongoDB Atlas:', error.message);
        process.exit(1);
    });

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
});
const Employee = mongoose.model('Employee', employeeSchema);

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below
// The bundled frontend files contain both URL styles, so support both.
const apiPaths = ['/api/employeelist', '/employeelist'];

function handleApiError(res, error) {
    console.error(error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Something went wrong on the server.' });
}

//TODO: get data from db  using api '/api/employeelist'
app.get(apiPaths, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        handleApiError(res, error);
    }
});

//TODO: get single data from db  using api '/api/employeelist/:id'
app.get(['/api/employeelist/:id', '/employeelist/:id'], async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID.' });
        }
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        res.json(employee);
    } catch (error) {
        handleApiError(res, error);
    }
});

//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post(apiPaths, async (req, res) => {
    try {
        const employee = await Employee.create({
            name: req.body.name,
            location: req.body.location,
            position: req.body.position,
            salary: req.body.salary
        });
        res.status(201).json(employee);
    } catch (error) {
        handleApiError(res, error);
    }
});

//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete(['/api/employeelist/:id', '/employeelist/:id'], async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID.' });
        }
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        res.json({ message: 'Employee deleted successfully.', employee });
    } catch (error) {
        handleApiError(res, error);
    }
});

//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put(apiPaths, async (req, res) => {
    try {
        const { _id, id, name, location, position, salary } = req.body;
        const employeeId = _id || id;
        if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({ message: 'A valid employee ID is required to update.' });
        }
        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            { name, location, position, salary },
            { new: true, runValidators: true }
        );
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        res.json(employee);
    } catch (error) {
        handleApiError(res, error);
    }
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Employee app server listening on port ${PORT}`);
});
