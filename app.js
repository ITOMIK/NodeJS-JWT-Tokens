const express = require("express");
   
const app = express();
   
const jwt = require('jsonwebtoken');

const { Pool } = require('pg');

const secretKey = 'U:Wd/p:tb6t0PzEne=:yucH{#QsUvVH(FEf+:CJcU":-y%J:Uu`O>pE#,Y0BgN';

var db =  require("./db.js");

function getToken(id, name){
    const payload = {
      sub: id,
      name: name,
      iat: Math.floor(Date.now() / 1000), // Время создания токена в секундах с начала эпохи Unix
      exp: Math.floor(Date.now() / 1000) + 90, // Время истечения через 1.5 минут (90 секунд)
    };
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    return token;
  }

  function verifyToken(token, secretKey) {
    try {
      // Попытка декодировать и верифицировать токен
      const decoded = jwt.verify(token, secretKey);
      return decoded; // Возвращает декодированные данные
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return false
        // Обработка случая истекшего токена
      } else {
        console.error('Ошибка верификации токена:', error.message);
        throw error;
      }
    }
  }

  


// создаем парсер для данных application/x-www-form-urlencoded
const urlencodedParser = express.urlencoded({extended: false});

function getId(List){
  List = List.sort((a, b) => a.id - b.id);
  var id = 0;
  for(var i=0; i< List.length;i++){
    if(List[i].id==id){
      id =List[i].id+1;
    }
    else{
      return id;
    }
  }
  return id;
}


app.post("/reg", urlencodedParser, async function (request, response) {
  if(!request.body) return response.sendStatus(400);
  const user = await db.select(request.body.username, request.body.password);
  console.log(request.body, user);
  if(user.length==0){
    var User1 = {username: request.body.username,  password:  request.body.password};
    await db.append(User1.username, User1.password);
    console.log(await db.getAlllTable());
    const u = await db.select(User1.username, User1.password);
    if (u.length==1){
      var answer = '{"token": "' + getToken(id=u[0].id, name=User1.username)+'", "status":"success"}';
      response.send(JSON.parse(answer));
    }
    else{
      response.send(JSON.parse('{"status":"incorectdata"}'));
      }
  }
  else{
      response.send(JSON.parse('{"status":"incorectdata"}'));
      }
 
  }
);

app.post('/token', urlencodedParser, function (request, response)  {
  if(!request.body) return response.sendStatus(400);
  var status = "fault";
  if(verifyToken(request.body.token, secretKey)){
    status = "success";
  }
  response.send(JSON.parse(`{"status": "${status}"}`));
});

app.post("/login", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    const user= db.select(request.body.username, request.body.password);
    console.log(request.body);
    if(user.length>0){
        var answer = '{"token": "' + getToken(id=user[0].id, name=request.body.username)+'", "status":"success"}';
        response.send(JSON.parse(answer));  
    }
    else{
        response.send(JSON.parse('{"status":"fault"}'));
        }
    
});
   
app.listen(3000, ()=>console.log("Сервер запущен..."));