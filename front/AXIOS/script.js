axios({
  method: "get",
  url: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: {}, // packet header
  data: {}, // packet body
})
.then((res)=>{
  console.log(res)
})
.catch((err)=>{
  console.log(err)
});