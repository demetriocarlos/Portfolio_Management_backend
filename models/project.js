
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName:{type:String, required:true,},
    demoUrl:{type:String},
    repositoryURL:{type:String, required:true,},
    description:{type:String, required:true,},
    technologies: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    } 
})


projectSchema.set('toJSON', {
    transform:(document,returnedObject) =>{
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Project= mongoose.model('Project', projectSchema);

module.exports = Project;
