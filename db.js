const Pool = require('pg').Pool // import pg pool instance
// pg database configuration
const pool = new Pool({
  user: 'postgres', // username 'postgres' by default
  password: 'yourpassword', // password of psql
  host: 'localhost',  // host name
  port: 5432, // port number, 5432 by default
  database: 'users', // database name
});


function getId(List){
  
  List = List.sort((a, b) => a.id - b.id);
  var id = 0;
  for(var i=0; i< List.length;i++){
    if(List[i].id==id){
      var str = List[i].id;
      id =parseInt(str, 10)+1;
    }
    else{
      return id;
    }
  }
  return id;
}

async function getTable(){
  var users = []
  await pool.query('SELECT * FROM public.users')
.then(result => {
  users = result.rows;
  //return(result.rows); // результат будет в result.rows
})
.catch(error => {
  console.error('Ошибка выполнения SQL-запроса:', error);
});
return(users);
}
const pool_ = {
pool: pool,
getAlllTable: ()=>{  return(getTable())},
deleteById: async (id) => {
  const deleteQuery = `DELETE FROM public.users WHERE id = $1`;
  try {
     await pool.query(deleteQuery, [id]);
    console.log(`Элемент с id ${id} удален успешно.`);
  } catch (err) {
    console.error('Ошибка при удалении элемента:', err);
  }
},
append: async (username,password)=>{
  const column1 = getId(await getTable()); // Замените этим значением на значение для column1
  const column2 = username; // Замените этим значением на значение для column2
  const column3 = password; // Замените этим значением на значение для column3
  // SQL-запрос для вставки элемента
  const insertQuery = `INSERT INTO public.users (id, username, password) VALUES ($1, $2, $3)`;
  try {
  await pool.query(insertQuery, [column1, column2, column3]);
  console.log(`Элемент успешно добавлен в таблицу. с id = ${column1}`);
} catch (err) {
  console.error('Ошибка при вставке элемента:', err);
}
},
select: async(username, password)=>{
  const searchQuery =`SELECT * FROM public.users  WHERE username = $1 AND password = $2`;
  try {
  const result = await pool.query(searchQuery, [username, password]);
  console.log(result.rows);
  return result.rows;
  }
  catch (err) {
    console.error('Ошибка при поиске элемента:', err);
  }

}
}



// export the configuration
module.exports = pool_;
