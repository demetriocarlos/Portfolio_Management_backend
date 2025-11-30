
const bcrypt = require('bcryptjs')
const userRouter = require('express').Router()
const User= require('../models/user')
const middleware = require('../utils/middleware');

const multer = require('multer')
const {storage} = require('../utils/cloudinary');
const upload = multer({storage})
const {cloudinary} = require('../utils/cloudinary');

 
 
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{7,}$/;


userRouter.get('/users', middleware.userExtractor, async (request, response, next) => {
    try{
        
        const users = await User.find({})
        response.status(200).json(users)
    }catch (error){
        console.error('error al cargar los usuarios', error)
        next(error)
    }
})


userRouter.get('/profile', middleware.userExtractor, async (request, response, next) => {
    try{
        const userId = request.user.id;
        
        const user = await User.find({_id:userId})
        response.status(200).json(user)
    }catch(error){
        console.error('Error al cargar los datos del usuario', error)
        next(error)
    }
})


userRouter.get("/profile/:id", middleware.userExtractor, async (request, response, next) => {
    try{
        const {id}= request.params;
        const user = await User.findById(id)
        response.status(200).json(user)
    }catch(error){
        console.error("Error al cargar profile por id ", error)
        next(error)
    }
})


userRouter.get("/search", middleware.userExtractor, async (request, response, next) => {
    try{
        const {query} = request.query; // Obtiene el término de búsqueda desde la URL

        if(!query){
            return response.status(400).json({ error: 'El término de búsqueda es requerido' })
        }

        const users = await User.find({
            $or:[
                {name:{$regex: query, $options: 'i'}},// Busca coincidencias en el nombre (insensible a mayúsculas/minúsculas)
                {userName: {$regex: query,$options:'i'}}, // Busca coincidencias en el username
            ]
        })//.select('userName' ); // Solo devuelve los campos necesarios

        response.status(200).json(users)

    }catch(error){
        console.error("Error al realizar la busqueda de usuarios", error)
        next(error)
    }
}) 


userRouter.post('/signup', async (request, response, next) => {
    try{
        const {userName,password, email} = request.body;

        if (!userName || !password || ! email){
            return response.status(400).json({error: "El nombre de usuario  la contraseña y email son obligatorios"})
        }

        if (! email ||  email.trim() ===''){
            return response.status(400).json({error:"el campo  email es obligatorio y no puede estar vacio"})
        }

        // Verificar que el nombre de usuario  tengan al menos 4 caracteres
        if (userName.length < 4 ){
            return response.status(400).json({error: " el nombre de usuario debe tener almenos 4 caracteres"})
        }

        // Validar que la contraseña cumpla con los requisitos
        if(!passwordRegex.test(password)){
            return response.status(400).json({
                error: "La contraseña debe tener al menos 7 caracteres, incluyendo una letra mayúscula, una letra minúscula y un número."
            })
        }

         // Validación combinada para `username` y `gmail`
        const existingUser = await User.findOne({
            $or : [{userName}, { email}]
        })


        if(existingUser){
            if(existingUser.userName === userName){
                return response.status(400).json({error:"El nombre de usuario ya esta en uso.  Por favor, usa otro"})
            }
            if(existingUser.email ===  email){
                return response.status(400).json({error: 'El correo electrónico ya está en uso. Por favor, usa otro correo.' })
            }
        }

        const saltRounds = 10;
        // Hashear la contraseña antes de guardar el usuario
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Crear un nuevo usuario con el hash de la contraseña
        const user= new User({userName, email,passwordHash});

        // Guardar el nuevo usuario en la base de datos
        const savedUser = await user.save();

        response.status(201).json(savedUser)

    }catch (error) {
        console.error('Error al crear la cuenta', error)
        next(error)
    }
})




userRouter.patch('/profile/:id', middleware.userExtractor, async (request, response, next) => {

    try{
        
        const {id} = request.params;
        const  userDataUPdated = request.body;
         

        const user = await User.findById(id)

        if (!user){
            return response.status(404).json({error : 'el   usuario no se encuentra'})
        } 
        

        if(user._id.toString() !==  request.user.id.toString()){
            return response.status(403).json({error: 'no autorizado para actualizar esta propiedad'})
        }
    
        const validations = {
            userName: { min: 4, message: 'El nombre de usuario debe tener al menos 4 caracteres' },
             email: { pattern: /.+@.+\..+/, message:   "Por favor ingrese un correo válido" },
             jobTitle: { min: 5, message: ' Cargo/Posición debe tener al menos 5 caracteres' },
             biography: { min: 10, message: ' su biografia debe tener al menos 10 caracteres' }
        }


          for (const [field, validation] of Object.entries(validations)) {
            if ( userDataUPdated[field]) {
                const value =  userDataUPdated[field].toString().trim();
                
                // Validación para campos con longitud mínima
                if (validation.min && value.length < validation.min) {
                    return response.status(400).json({ error: validation.message });
                }
                
                // ✅ Validación especial para email con expresión regular
                if (field === 'email' && validation.pattern) {
                    if (!validation.pattern.test(value)) {
                        return response.status(400).json({ error: validation.message });
                    }
                }
            }
        }

        const updateUser= await User.findByIdAndUpdate(id, { $set: userDataUPdated }, {new:true , runValidators: true})


        response.status(200).json(updateUser)

    }catch(error){
        console.error('Error al actualizar la propiedad del usuario',error)
        next(error)
    }
})


userRouter.patch('/profile/:id/profile-picture', middleware.userExtractor,  upload.single('image'), async (request, response, next)=>{
    const userId = request.params.id;
    const imageUrl= request.file?.path;
   // console.log('imageUrl', imageUrl)
    try{
         

        const user = await User.findById(userId)

        if (!user){
            return response.status(404).json({error : 'el   usuario no se encuentra'})
        } 
        
        
        if(user._id.toString() !==  request.user.id.toString()){
            return response.status(403).json({error: 'no autorizado para actualizar esta propiedad'})
        }
        
        if (!request.file) {
            return response.status(400).json({ error: 'No se subió ninguna imagen' });
        }
        
        
        // 🧹 Eliminar imagen anterior en Cloudinary si existe
        if (user.profilePictureId) {
            await cloudinary.uploader.destroy(user.profilePictureId);
        }

         

        // 📦 Subida exitosa: guardar info nueva
      user.profilePicture = request.file.path;       // secure_url
      user.profilePictureId = request.file.filename; // public_id

      const updatedUser = await user.save();


        //user.profilePicture = imageUrl;
        //await user.save();



        response.json({ message: 'Imagen actualizada', imageUrl: updatedUser.profilePicture });
    }catch(error){
        console.error('Error al actualizar la imagen', error)
        next(error)
    }
})


userRouter.patch('/profile/:id/delete-picture', middleware.userExtractor,  upload.single('image'), async (request, response, next)=> {
    try{
        const userId = request.params.id;

         
        const user = await User.findById(userId)

        if (!user){
            return response.status(404).json({error : 'el   usuario no se encuentra'})
        } 
        
        
        if(user._id.toString() !==  request.user.id.toString()){
            return response.status(403).json({error: 'no autorizado para actualizar esta propiedad'})
        }
        
         
        
        
        // 🧹 Eliminar imagen anterior en Cloudinary si existe
        if (user.profilePictureId) {
            await cloudinary.uploader.destroy(user.profilePictureId);
        }


        // 🧼 Limpiar campos en la base de datos
        user.profilePicture = '';
        user.profilePictureId = '';


        const updatedUser = await user.save();
        
        return response.json({ 
            message: 'Imagen eliminada con éxito', 
            user: updatedUser,
        });

    }catch(error) {
        console.error('Error al eliminar la imagen',error)
        next(error)
    }
})
  
 

module.exports = userRouter;


