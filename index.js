const express = require('express');
const app = express();
const db = require('./database.js');
const hal = require('express-hal');
app.use(express.json());
app.use(hal.middleware);

const filmController = require('./controllers/films');
const categoryController = require('./controllers/categories');

////////////////////////// RECUPERER LA LISTE DE TOUS LES FILMS AVEC PAGINATION ////////////////////
app.get("/api/films", filmController.getFilms);
///////////////////////  RECUPERER UN FILM PAR SON ID ////////////////////////////// 
app.get("/api/films/:id", filmController.getFilmById);
////////////////// RECHERCHE FILMS QUERY PARAMS //////////////////  
app.get("/api/search/films", filmController.getFilmByQuery);
////////////////////////////////  AJOUT DUN FILM ////////////////////////////////// 
app.post("/api/films", filmController.addFilm);
/////////////////////////////// UPDATE UN FILM //////////////////////////////////// 
app.put("/api/films/:id", filmController.updateFilm);
///////////////////////  DELETE UN FILM ////////////////////////////////////// 
app.delete("/api/films/:id", filmController.deleteFilm);



/////////////////////////// AJOUT DUNE NOUVELLE CATEGORIE ///////////////////////// 
app.post('/api/categories', categoryController.addCategory);
//////////////////// RECUPERER TOUTES LES CATEGORIES ///////////////////////////////// 
app.get('/api/categories', categoryController.getAllCategories);
//////////////////// LISTER LES CATEGORIES D'UN FILM ///////////////////////// 
app.get('/api/films/:id/categories', categoryController.getFilmCategories);
///////////////////////////////// LISTER LES FILMS D'UNE CATEGORIE //////////////////////////// 
app.get('/api/categories/:id/films', categoryController.getCategoryFilms);




const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
