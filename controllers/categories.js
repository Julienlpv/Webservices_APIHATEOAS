const Category = require('../models/category');
const Film = require('../models/film');

// ///////////////////////// AJOUT DUNE NOUVELLE CATEGORIE ///////////////////////// 
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = new Category({ name });
        await category.save();

        res.hal({
            data: category.toObject()
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(422).send(error.message);
        } else {
            res.status(500).send("Erreur lors de la création de la catégorie.");
        }
    }
};
    //////////////////// RECUPERER TOUTES LES CATEGORIES ///////////////////////////////// 
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        const categoriesHal = categories.map(category => ({
            data: category.toObject()
        }));

        res.hal({
            data: categoriesHal,
            links: {
                self: { href: `/api/categories` } 
            }
        });
    } catch (error) {
        res.status(500).send("Erreur lors de la récupération des catégories.");
    }
}

//////////////////// LISTER LES CATEGORIES D'UN FILM ///////////////////////// 
const getFilmCategories = async (req, res) => {
    try {
        const film = await Film.findById(req.params.id).populate('categories');
        if (!film) {
            return res.status(404).send('Film non trouvé.');
        }

        const categoriesHal = film.categories.map(category => ({
            data: category.toObject(),
            links: {
                self: { href: `/api/categories/${category._id}` } 
            }
        }));

        res.hal({
            data: categoriesHal,
            links: {
                self: { href: `/api/films/${req.params.id}/categories` } 
            }
        });
    } catch (error) {
        res.status(500).send("Erreur lors de la récupération des catégories du film.");
    }
}
    ///////////////////////////////// LISTER LES FILMS D'UNE CATEGORIE //////////////////////////// 
const getCategoryFilms = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const films = await Film.find({ categories: categoryId });

        const filmsHal = films.map(film => ({
            data: film.toObject(), 
            links: {
                self: { href: `/api/films/${film._id}` } 
            }
        }));

        res.hal({
            data: filmsHal,
            links: {
                self: { href: `/api/categories/${categoryId}/films` } 
            }
        });
    } catch (error) {
        res.status(500).send("Erreur lors de la récupération des films de la catégorie.");
    }
}

module.exports = {
        addCategory,
        getAllCategories,
        getFilmCategories,
        getCategoryFilms
};
