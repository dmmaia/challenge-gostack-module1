const express = require("express");
const cors = require("cors");
const { uuid } = require('uuidv4');
var ip = require("ip");

let NeDb = require('nedb')

let dbRepositories = new NeDb({
  filename: 'db/repositories.db',
  autoload: true
})

let dbLikes = new NeDb({
  filename: 'db/likes.db',
  autoload: true
})

const app = express();

app.use(express.json());
app.use(cors());

app.get("/repositories", (request, response) => {
  dbRepositories.find({}, function (err, repositore) {
    return response.json(repositore);
  });

});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const likes = 0;

  const repositore = { title, likes, url, techs, id: uuid() };

  dbRepositories.insert(repositore, (err, repositore) => {
    if (err) {
      return response.status(400).send();
    } else {
      response.status(200).json(repositore);
    }
  })

});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, likes, url, techs } = request.body;

  if (likes) {
    response.json({ "likes": 0 })
  } else {

    const newRepositore = {
      title,
      url,
      techs,
      id,
    };

    dbRepositories.update({ id }, newRepositore ,{}, function (err, numReplaced) {
      if (numReplaced <= 0) {
        response.status(400).send();
      } else {
        return response.json(newRepositore);
      }
    });

  }

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  dbRepositories.remove({ id }, {}, function (err, numRemoved) {
    if (numRemoved <= 0) {
      response.status(400).send();
    } else {
      response.status(204).send();
    }
  });

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repositoryId = id;

      dbLikes.find({repositoryId}, function (err, docs) {
        const likes = docs.length+1;
        dbRepositories.update({ id }, { $set: { likes } }, { multi: true }, function (err, numReplaced) {
          if (numReplaced <= 0) {
            response.status(400).send();
          } else {
            dbLikes.insert({repositoryId}, (err) => {
              if (err) {
                response.status(400).send();
              }else{
                response.json({likes});
              }
            })

          }
        });
      })
});

app.delete("/tests1", (request, response)=>{
  dbRepositories.remove({ }, { multi: true }, function (err, numRemoved) {
    db.loadDatabase(function (err) {
      // done
    });
  });
});

app.delete("/tests2", (request, response)=>{
  dbLikes.remove({ }, { multi: true }, function (err, numRemoved) {
    db.loadDatabase(function (err) {
      // done
    });
  });
});

module.exports = app;
