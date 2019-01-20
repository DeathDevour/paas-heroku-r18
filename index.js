const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const followingID = process.env.ID
const pool = new Pool({
  connectionString: process.env.HEROKU_POSTGRESQL_PINK_URL,
  ssl: true
});

var app = express();

var bodyParser = require('body-parser')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static(path.join(__dirname, 'public')))
  
app.set('views', path.join(__dirname, 'views'))
  
app.set('view engine', 'ejs')
  
app.get('/', (req, res) => res.render('pages/index'))

app.get('/cool', (req, res) => res.send(cool()))
  
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get('/times', (req, res) => {
  let result = ''
  const times = process.env.TIMES || 5
  for (i = 0; i < times; i++) {
    result += i + ' '
  }
  res.send(result)
});

app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM test_table');
    res.render('pages/db', result);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get('/snippets', async (req, res) => {
  try {
    const client = await pool.connect()

    var name = "%";
	var description = "%";
	var author = "%";
	var language = "%";
	var code = "%";
	var tag1 = "%";
	var tag2 = "%";
	var tag3 = "%";

	if(req.query.name!=null){name = req.query.name};
    if(req.query.description!=null){description = req.query.description};
    if(req.query.author!=null){author = req.query.author};
    if(req.query.language!=null){language = req.query.language};
    if(req.query.code!=null){code = req.query.code};
    if(req.query.tags!=null){tag1 = req.query.tag1};
    if(req.query.tags!=null){tag2 = req.query.tag2};
    if(req.query.tags!=null){tag3 = req.query.tag3};
    	
   	const result = await client.query('SELECT * FROM snippets where name like \'' + name + '\' AND description like \'' + description + '\' AND author like \'' + author + '\' AND language like \'' + language + '\' AND code like \'' + code + '\' AND tags[1] like \'' + tag1 + '\' AND tags[2] like \'' + tag2 + '\' AND tags[3] like \'' + tag3 + '\'');

    res.send(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error 404: Snippets were not found");
  }
});

app.post('/snippets', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query('INSERT INTO Snippets (NAME,description,author,language,code,tags) VALUES (\'' + req.body.name + '\', \'' + req.body.description + '\', \'' + req.body.author + '\', \'' + req.body.language + '\', \'' + req.body.code + '\', \'' + req.body.tags +'\');');
    res.send("Snippet was saved");
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error 400");

  }

  followingID = followingID+1;
});

app.get('/snippets/:id', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM snippets where id = \'' + req.params.id + '\'');
    res.send(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error 404: Snippet was not found");
  }
});

app.post('/snippets/:id', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query('UPDATE Snippets set name=\'' + req.body.name + '\',description=\'' + req.body.description + '\',author=\'' + req.body.author + '\',language=\'' + req.body.language + '\',code=\'' + req.body.code + '\',tags=\'' + req.body.tags + '\' where id = \'' + req.params.id + '\'');
    res.send("Snippet was updated");
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error 404: Snippet was not found");
  }
});

app.delete('/snippets/:id', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query('DELETE FROM snippets where id = \'' + req.params.id + '\'');
    res.send("Snippets was removed");
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error 404: Snippet was not found");
  }
});