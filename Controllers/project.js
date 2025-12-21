

const projectRouter = require('express').Router();
const Project = require('../models/project');
const User = require('../models/user')



projectRouter.get('/', async (request, response, next) => {
    try{
        const project = await Project.find({}).populate('user', {userName:1, profilePicture:1})

        response.status(200).json(project)

    }catch(error){
        console.error('Error al cargar los proyectos', error)
        next(error);
    }
})

projectRouter.get('/myProjects', async (request, response, next) => {
    try{
        const userId = request.user.id;
        const myProject = await Project.find({user:userId}).populate('user', {userName:1, profilePicture:1})
        response.status(200).json(myProject);
    }catch(error){
        console.error('Error al cargar los proyectos del usuario', error)
        next(error)
    }
})

projectRouter.get("/projectsId/:id", async (request, response,next) => {
    try{
       const {id} = request.params;
        
        const project= await Project.find({user:id}).populate('user')
         
        response.status(200).json(project)
    }catch(error){
        console.error("Error al cargar los proyectos por id", error)
        next(error)
    }
})


projectRouter.get("/search", async (request, response, next) => {
    try{
        const {query} = request.query;
        
        if(!query){
            response.status(400).json({ error: 'El término de búsqueda es requerido' })
        }
        

        const projects = await Project.find({
            $or:[
                {name: {$regex : query, $options: 'i'}},// Busca coincidencias en el nombre (insensible a mayúsculas/minúsculas)
                {projectName:{$regex: query, $options:'i'}},  // Busca coincidencias en el projectname
            ]
        }).populate('user', 'profilePicture')

        response.status(200).json(projects)

    }catch(error){
        console.error("Error al realizar la busqueda de los proyectos", error)
        next(error)
    }
})



projectRouter.post('/', async (request, response, next) =>{
    try{
        const {projectName,demoUrl,repositoryURL,description,technologies}= request.body;

        if(!projectName){
            return response.status(404).json({error:'El nombre del proyecto es obligatorio'})
        }else if(!repositoryURL){
            return response.status(404).json({error:'La url del repositorio es obligatoria'})
        }else if(!description){
            return response.status(404).json({error:'L descripcion es obligatoria'})
        }/*/else{
            return;
        }*/

        const user= request.user
        const project = new  Project({
            projectName,
            demoUrl,
            repositoryURL,
            description,
            technologies,
            user:user._id
        })


        const projectSave=  await project.save();

        response.status(201).json(projectSave)

    }catch(error){
        console.error('Error al crear el proyecto', error)
        next(error)
    }
})



projectRouter.patch('/:id', async (request, response, next) =>{
    try{
         const { id } = request.params
         const changes = request.body

        const project = await Project.findById(id)

        if(project.user._id.toString() !== request.user.id.toString()){
            return response.status(403).json({error:'No autorizado para actualizar esta propiedad'})
        }
         

        // Validaciones de campos
        const validations = {
            projectName: { min: 4, message: 'El nombre del proyecto debe tener al menos 4 caracteres' },
            description: { min: 10, message: 'La descripción debe tener al menos 10 caracteres' },
            technologies: { min: 2, message: 'Tecnologías debe tener al menos 2 caracteres' }
        }

        // Aplicar validaciones solo a los campos que vienen en changes
        for (const [field, validation] of Object.entries(validations)) {
            if (changes[field] && changes[field].toString().trim().length < validation.min) {
                return response.status(400).json({ error: validation.message })
            }
        }

        // Validar URLs si están presentes
        if (changes.demoUrl && !isValidUrl(changes.demoUrl)) {
            return response.status(400).json({ error: 'URL de demo no válida' })
        }

        if (changes.repositoryURL && !isValidUrl(changes.repositoryURL)) {
            return response.status(400).json({ error: 'URL de repositorio no válida' })
        }

        const updateProject = await Project.findByIdAndUpdate(
            id, 
            { $set: changes } ,  
            {new:true, runValidators: true}
        )

        response.status(200).json(updateProject)
    }catch(error){
        console.error('Error al actualizar el proyecto', error)
        next(error);
    }
})


projectRouter.delete('/:id', async (request, response, next) =>{
    try{
        const {id} = request.params;

        const project= await Project.findById(id);

        if(!project){
            response.status(404).json({error:'el proyecto que deseas eliminar no existe'})
        }

        if(project.user._id.toString() !== request.user.id.toString()){
            response.status(403).json({error:'No estas autorizado para para eliminar este proyecto'})
        }

          await Project.findByIdAndDelete(id)

        response.status(204).end();

    }catch(error){
        console.error('Error al eliminar este proyecto', error)
        next(error)
    }
})

 

projectRouter.put('/:id/favorites', async (request, response,next) => {
    try{
        const {id} = request.params;
         
         
        const project = await Project.findById(id).populate('user')
        if(!project){
            return response.status(404).json({error:'Proyecto no encontrado'})
        }


        
        const userId = request.user._id.toString()


        //   Verificar si el usuario existe
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return response.status(404).json({ error: 'Usuario no encontrado' });
        }



        const userFavorites=  project.favorites.some(
            favId => favId.toString() === userId.toString()
        );

        //manejo de favoritos agregar o quitar favoritos
        if(userFavorites){
            //si el usuario lla dio como favorito lo quitamos
            project.favorites= project.favorites.filter(favorite => favorite.toString() !== userId.toString())
        }else{
            //si el usuario no ha dado a favorites lo agregamos
            project.favorites.push(userId);
        }

        const updateProjects = await project.save();
        response.status(200).json(updateProjects);

    }catch(error){
        console.error('Error al guardar a favoritos', error)
        next(error)
    }
})
 

module.exports= projectRouter;
