const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function askQuestion(question, callback) {
    readline.question(question, (answer) => {
      callback(answer);
    });
  }
  
  let questions = {};
  function askNextQuestion(questionNumber) {
    if (questionNumber <= 6) {
        if(questionNumber === 1){
            askQuestion(`\x1b[34mEnter Module Name: `, (answer) => {
                if(answer !== ''){
                    questions.moduleName = answer;
                    askNextQuestion(questionNumber + 1);
                } else {
                    readline.close();
                }
            });
        } else if(questionNumber === 2){
            askQuestion(`You want '${questions.moduleName}.route.js' (press 1/0): `, (answer) => { 
                if(answer == 1){
                    questions.file1 = `${questions.moduleName}.route.js`; 
                    askNextQuestion(questionNumber + 1);
                } else {
                    askNextQuestion(questionNumber + 1);
                }
            });
        } else if(questionNumber === 3){
            askQuestion(`You want '${questions.moduleName}.controller.js' (press 1/0): `, (answer) => { 
                if(answer == 1){
                    questions.file2 = `${questions.moduleName}.controller.js`; 
                    askNextQuestion(questionNumber + 1);
                } else {
                    askNextQuestion(questionNumber + 1);
                }
            });
        } else if(questionNumber === 4){
            askQuestion(`You want '${questions.moduleName}.service.js' (press 1/0): `, (answer) => { 
                if(answer == 1){
                    questions.file3 = `${questions.moduleName}.service.js`; 
                    askNextQuestion(questionNumber + 1);
                } else {
                    askNextQuestion(questionNumber + 1);
                }
            });
        } else if(questionNumber === 5){
            askQuestion(`You want '${questions.moduleName}.model.js' (press 1/0): `, (answer) => { 
                if(answer == 1){
                    questions.file4 = `${questions.moduleName}.model.js`; 
                    askNextQuestion(questionNumber + 1);
                } else {
                    askNextQuestion(questionNumber + 1);
                }
            });
        } else if(questionNumber === 6){
            askQuestion(`You want '${questions.moduleName}.validation.js' (press 1/0): `, (answer) => { 
                console.log('\x1b[0m');
                if(answer == 1){
                    questions.file5 = `${questions.moduleName}.validation.js`; 
                    askNextQuestion(questionNumber + 1);
                } else {
                    askNextQuestion(questionNumber + 1);
                }
            });
        }
    } else {
      readline.close();
      generateFiles(questions);
    }
  }
  
  process.nextTick(() => {
    askNextQuestion(1);
  });


// Function to generate controller, model, and route files
function generateFiles(questions) {
    let newFile = false;
    const name = questions.moduleName;
    const capital = name ? name.charAt(0).toUpperCase() + name.slice(1) : ''; 
  
    
    const routeContent = `const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { ${name}Validation } = require('../../validations');
const { ${name}Controller } = require('../../controllers'); 

const router = express.Router();

// Create and Get All
router
  .route('/')
  .post(auth(), validate(${name}Validation.create${capital}), ${name}Controller.create${capital})
  .get(auth(), validate(${name}Validation.get${capital}s), ${name}Controller.get${capital}s);
  
// Get by ID, Update, Delete  
router
  .route('/:id')
  .get(auth(), validate(${name}Validation.get${capital}), ${name}Controller.get${capital})
  .patch(auth(), validate(${name}Validation.update${capital}), ${name}Controller.update${capital})
  .delete(auth(), validate(${name}Validation.delete${capital}), ${name}Controller.delete${capital});


module.exports = router;`;


    const validationContent = `const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const create${capital} = {
    body: Joi.object().keys({ 
        name: Joi.string().required(), 
    }),
};

const get${capital}s = {  
    query: Joi.object().keys({
        name: Joi.string(), 
    }),
};

const get${capital} = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId),
    }),
};
  
const update${capital} = {
    params: Joi.object().keys({
        id: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({ 
          name: Joi.string(),
        })
        .min(1),
};
  
const delete${capital} = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId),
    }),
};

module.exports = {
    create${capital},
    get${capital}s, 
    get${capital},
    update${capital},
    delete${capital}
};`;


    const controllerContent = `const httpStatus = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { ${name}Service } = require('../services');

const create${capital} = catchAsync(async (req, res) => {
    const ${name} = await ${name}Service.create${capital}(req.body);
    res.status(httpStatus.CREATED).send(${name});
});
  
const get${capital}s = catchAsync(async (req, res) => { 
    const result = await ${name}Service.query${capital}s();
    res.send(result);
});

const get${capital} = catchAsync(async (req, res) => {
    const ${name} = await ${name}Service.get${capital}ById(req.params.id);
    if (!${name}) {
      throw new ApiError(httpStatus.NOT_FOUND, '${name} not found');
    }
    res.send(${name});
});
  
const update${capital} = catchAsync(async (req, res) => {
    const ${name} = await ${name}Service.update${capital}ById(req.params.id, req.body);
    res.send(${name});
});
  
const delete${capital} = catchAsync(async (req, res) => {
    await ${name}Service.delete${capital}ById(req.params.id);
    res.status(httpStatus.NO_CONTENT).send('success');
});


module.exports = {
    create${capital},
    get${capital}s, 
    get${capital},
    update${capital},
    delete${capital}
}; 
`;


    const servicesContent = `const httpStatus = require('http-status');
const { ${capital} } = require('../models'); 


const create${capital} = async (body) => { 
    return ${capital}.create(body);
};

const query${capital}s = async () => {
    const ${name}s = await ${capital}.find();
    return ${name}s;
};

const get${capital}ById = async (id) => {
    return ${capital}.findById(id);
};

const update${capital}ById = async (id, updateBody) => {
    const ${name} = await get${capital}ById(id);
    if (!${name}) {
      throw new ApiError(httpStatus.NOT_FOUND, '${name} not found');
    } 

    Object.assign(${name}, updateBody);
    await ${name}.save();
    return ${name};
};

const delete${capital}ById = async (id) => {
    const ${name} = await get${capital}ById(id);
    if (!${name}) {
      throw new ApiError(httpStatus.NOT_FOUND, '${name} not found');
    }
    await ${name}.remove();
    return ${name};
};

module.exports = {
    create${capital},
    query${capital}s,
    get${capital}ById,
    update${capital}ById,
    delete${capital}ById
};
`;


    const modelContent = `const mongoose = require("mongoose");
// Model for ${name}
// Update your model schema

const ${name}Schema = mongoose.Schema(
    {
        name: { type: String, required: true, maxlength: 50 },
    },
    { timestamps: true }
);

const ${capital} = mongoose.model('${capital}', ${name}Schema);
module.exports = ${capital};
`;
 
        if(questions.file1 && questions.file1 == `${name}.route.js`){ 
            const filePath = path.join(__dirname, '../src/routes/v1', `${name}.route.js`);
            if (!fs.existsSync(filePath)) {  
                fs.writeFileSync(path.join(__dirname, '../src/routes/v1', `${name}.route.js`), routeContent);
                newFile = true;
            } else { 
                console.log(`\x1b[31m ${name}.route.js file already exist in routes/v1 \x1b[0m`);
            }
        }

        if(questions.file2 && questions.file2 == `${name}.controller.js`){  
            const filePath = path.join(__dirname, '../src/controllers', `${name}.controller.js`);
            if (!fs.existsSync(filePath)) {  
                fs.writeFileSync(path.join(__dirname, '../src/controllers', `${name}.controller.js`), controllerContent);
                const controllersIndexPath = path.join(__dirname, '../src/controllers', 'index.js'); 
                fs.appendFileSync(controllersIndexPath, `module.exports.${name}Controller = require('./${name}.controller');\n`);
                newFile = true;
            } else { 
                console.log(`\x1b[31m ${name}.controller.js file already exist in controllers \x1b[0m`);
            } 
        }

        if(questions.file3 && questions.file3 == `${name}.service.js`){  
            const filePath = path.join(__dirname, '../src/services', `${name}.service.js`);
            if (!fs.existsSync(filePath)) {  
                fs.writeFileSync(path.join(__dirname, '../src/services', `${name}.service.js`), servicesContent);
                const servicesIndexPath = path.join(__dirname, '../src/services', 'index.js'); 
                fs.appendFileSync(servicesIndexPath, `module.exports.${name}Service = require('./${name}.service');\n`);
                newFile = true;
            } else { 
                console.log(`\x1b[31m ${name}.service.js file already exist in services \x1b[0m`);
            } 
        } 

        if(questions.file4 && questions.file4 == `${name}.model.js`){  
            const filePath = path.join(__dirname, '../src/models', `${name}.model.js`);
            if (!fs.existsSync(filePath)) {  
                fs.writeFileSync(path.join(__dirname, '../src/models', `${name}.model.js`), modelContent);
                const modelsIndexPath = path.join(__dirname, '../src/models', 'index.js'); 
                fs.appendFileSync(modelsIndexPath, `module.exports.${capital} = require('./${name}.model');\n`);
                newFile = true;
            } else { 
                console.log(`\x1b[31m ${name}.model.js file already exist in models \x1b[0m`);
            } 
        } 

        if(questions.file5 && questions.file5 == `${name}.validation.js`){ 
            const filePath = path.join(__dirname, '../src/validations', `${name}.validation.js`);
            if (!fs.existsSync(filePath)) {  
                fs.writeFileSync(path.join(__dirname, '../src/validations', `${name}.validation.js`), validationContent);
                const validationsIndexPath = path.join(__dirname, '../src/validations', 'index.js'); 
                fs.appendFileSync(validationsIndexPath, `module.exports.${name}Validation = require('./${name}.validation');\n`);
                newFile = true;
            } else { 
                console.log(`\x1b[31m ${name}.validation.js file already exist in validations \x1b[0m`);
            }  
        } 

        if(newFile == true){
            console.log(`\x1b[32m${name} module Generated success \x1b[0m`);
        }
}
   