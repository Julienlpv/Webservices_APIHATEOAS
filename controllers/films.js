const Category = require('../models/category');
const Film = require('../models/film');

// Ajoutez toutes les fonctions relatives aux films ici

////////////////////////// RECUPERER LA LISTE DE TOUS LES FILMS AVEC PAGINATION ///////////////////// OKOOKOK

const getFilms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit; 

        const films = await Film.find().skip(skip).limit(limit);
        const totalFilms = await Film.countDocuments(); 

        res.hal({
            data: films,
            links: { 
              self: `/api/films?page=${page}&limit=${limit}`,
            },
            embedded: {
              films: films.map(film => ({
                data: film,
                links: { self: `/api/films/${film._id}` }
              }))
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalFilms / limit),
                totalItems: totalFilms,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).send("Erreur lors de la récupération des films.");
    }
};

///////////////////////  RECUPERER UN FILM PAR SON ID ////////////////////////////// OKOKOK
    
const getFilmById = async (req, res) => {
    try {
        const filmId = req.params.id;
        const film = await Film.findById(filmId);

        if (!film) {
            return res.status(404).send("Le film correspondant à cet ID n'existe pas");
        }

        const filmObj = film.toObject();
        res.hal({
            data: filmObj,
            links: {
                self: { href: `/api/films/${filmId}` },
                categories: { href: `/api/films/${filmId}/categories` }
            }
        });

    } catch (error) {
        res.status(500).send("Erreur lors de la récupération du film.");
    }
};
    
    
////////////////// RECHERCHE FILMS QUERY PARAMS //////////////////  OKOKOK  

const getFilmByQuery = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const queryCondition = searchQuery
            ? {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } }
                ]
            }
            : {};

        const films = await Film.find(queryCondition);

        
        const filmsHal = films.map(film => ({
            data: film.toObject(),
            links: {
                self: { href: `/api/films/${film._id}` }
            }
        }));

        res.hal({
            data: filmsHal,
            links: {
                self: { href: `/api/search/films?q=${searchQuery}` }
            }
        });
    } catch (error) {
        res.status(500).send("Erreur lors de la recherche des films.");
    }
};
    



    
////////////////////////////////  AJOUT DUN FILM ////////////////////////////////// OKOKOK

const addFilm = async (req, res) => {
    try {
        const filmExists = await Film.findOne({ $or: [{ name: req.body.name }, { description: req.body.description }] });
        if (filmExists) {
            return res.status(422).send("Un film avec le même nom ou la même description existe déjà.");
        }

        const categoryIds = req.body.categories || [];
        for (const id of categoryIds) {
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).send(`La catégorie avec l'ID ${id} n'existe pas.`);
            }
        }

        const newFilm = new Film({
            name: req.body.name,
            description: req.body.description,
            date: req.body.date,
            rating: req.body.rating,
            categories: categoryIds
        });
        await newFilm.save();

        res.hal({
            data: newFilm.toObject(), 
            links: {
                self: { href: `/api/films/${newFilm._id}` },
                categories: { href: `/api/films/${newFilm._id}/categories` }
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(422).send(error.message);
        }
        res.status(500).send("Erreur lors de l'enregistrement du film.");
    }
}
    
/////////////////////////////// UPDATE UN FILM //////////////////////////////////// OKOKOK

const updateFilm = async (req, res) => {
    try {
        const filmId = req.params.id;
        const updateData = req.body;
        const updatedFilm = await Film.findByIdAndUpdate(filmId, updateData, { new: true });

        if (!updatedFilm) {
            return res.status(404).send("Le film correspondant à cet ID n'existe pas");
        }

        res.hal({
            data: updatedFilm.toObject(), 
            links: {
                self: { href: `/api/films/${updatedFilm._id}` },
                categories: { href: `/api/films/${updatedFilm._id}/categories` }
            }
        });
    } catch (error) {
        res.status(500).send("Erreur lors de la mise à jour du film.");
    }
}
    
///////////////////////  DELETE UN FILM ////////////////////////////////////// OKOKOKOK

const deleteFilm = async (req, res) => {
    try {
        const filmId = req.params.id;
        const film = await Film.findByIdAndDelete(filmId);

        if (!film) {
            return res.status(404).send("Le film correspondant à cet ID n'existe pas");
        }

        res.hal({
            data: {
                message: "Film supprimé avec succès."
            },
            links: {
                films: { href: `/api/films` }
            }
        });
    } catch (error) {
        res.status(500).send("Erreur lors de la suppression du film.");
    }
}

module.exports = {
        getFilms,
        getFilmById,
        getFilmByQuery,
        addFilm,
        updateFilm,
        deleteFilm
};
