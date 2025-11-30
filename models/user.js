
const mongoose = require('mongoose')



const userSchema = new mongoose.Schema({
    userName : {type: String,required:true, unique:true, minlength: 3},
    passwordHash : {
        type:String, 
        required:function () {
    return !this.githubId;
  }, 
  minlength:5},
    email: {type: String, require:true, unique : true, match: [/.+@.+\..+/, "Por favor ingrese un correo válido"]},
    githubId: { type: String, unique: true, sparse: true },
    jobTitle: {type:String,},
    biography: {type:String,},
    profilePicture: {type:String,},
    profilePictureId: { type: String },
    createdAt: { type: Date, default: Date.now },
    technologies: { type: [String], default: [] },
    location: { type: [String], default: [] },
    project:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Project'
        }] ,


    resetCode: String,
    resetCodeExpires: Date

})



userSchema.set('toJSON', {
    transform:(document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})


const User = mongoose.model('User', userSchema);

module.exports = User;

