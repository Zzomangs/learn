const express = require('express');
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const MongoClient = require('mongodb').MongoClient;
//npm i mongodb

const app = express();
const router = express.Router();
const port = 3000;

app.use(bodyParser.urlencoded({extended: false}));//.use 뒤에 apply가 따라오는지 확인하기<nodemon은 npm start를 해보고 노드몬 연결이 안되면 node파일명입력>

let database;//몽고디비 연결 객체


//mongodb 연결함수
function connectDB(){
  const databaseURL = "mongodb://localhost:27017";//몽고디비 프로토콜
  MongoClient.connect(databaseURL,(err,db) => {
    if(!err){//에러가 일어나지 않았을 때
      const tempdb = db.db('frontenddb01'); //접근하고자 하는 데이터베이스의 이름
      database = tempdb;
      console.log('mongodb 데이터베이스 연결 성공')
    }
    else{
      console.log(err);
    }
  });
}

//회원가입
// http://localhost:3000/member/regist (post)
router.route('/member/regist').post((req,res)=>{
  console.log('/member/regist 호출');
  const userid = req.body.userid;
  const userpw = req.body.userpw;
  const username = req.body.username;
  const age = req.body.age;
  //입력값확인
  console.log(`userid:${userid},userpw:${userpw},username:${username},age:${age}`)

  if(database){//데이터베이스가 생성되어 연결이 되었다면
    joinMember(database,userid,userpw,username,age,(err,result)=>{//insert 여부확인
      if(!err){
        if(result.insertedCount > 0){
          res.writeHead('200', {'content-type':'text/html;charset-utf8'});
          res.write('<h2>회원가입성공!</h2>');
          res.write('<p>가입이 성공적으로 완료되었습니다.</p>');
          res.end();
        }
        else{
          res.writeHead('200', {'content-type':'text/html;charset-utf8'});
          res.write('<h2>회원가입실패</h2>');
          res.write('<p>오류발생</p>');
          res.end();
        }
      }
      else{
        res.writeHead('200', {'content-type':'text/html;charset-utf8'});
        res.write('<h2>회원가입실패</h2>');
        res.write('<p>오류발생</p>');
        res.end();
      }
    })//함수호출
  }
  else{
    res.writeHead('200', {'content-type':'text/html;charset-utf8'});
    res.write('<h2>데이터베이스연결실패</h2>');
    res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다.</p>');
    res.end();

  }

});

//로그인
// http://localhost:3000/member/login (post)

router.route('/member/login').post((req,res)=>{
  console.log('/member/login 호출!');
  const userid = req.body.userid;
  const userpw = req.body.userpw;
  console.log(`userid:${userid}, userpw:${userpw}`);

  if(database){//database연결상태확인
    loginMember(database, userid, userpw, (err,result)=>{
      if(!err){//콜백함수 연결상태 확인
        if(result){//콜백 함수에서 받은 result를 확인
          //reslut값에 대한 확인
        console.dir(result);//db에서 정보를 갖고 옴
        const resultUserid = result[0].userid;
        const resultUserpw = result[0].userpw;
        const resultUsername = result[0].username;
        const resultAge = result[0].age;

        //로그인 정보 출력
        res.writeHead('200', {'content-type':'text/html;charset-utf8'});
        res.write('<h2>로그인성공</h2>');
        res.write(`<p>${resultUserid}(${resultUsername})님 환영합니다.</p>`);
        res.write(`<p>나이 :${resultAge}살.</p>`);
        res.write(`<p>기존비밀번호 :${resultUserpw}였습니다.</p>`);
        res.end();
        }
        else{
          res.writeHead('200', {'content-type':'text/html;charset-utf8'});
          res.write('<h2>로그인실패</h2>');
          res.write('<p>아이디/비밀번호를 확인해주세요.</p>');
          res.end();
        }
        
      }
      else{
        res.writeHead('200', {'content-type':'text/html;charset-utf8'});
        res.write('<h2>로그인실패</h2>');
        res.write('<p>서버오류 발생! 로그인에 실패했습니다.</p>');
        res.end();
      }
    })
  }
  else{
    res.writeHead('200', {'content-type':'text/html;charset-utf8'});
    res.write('<h2>데이터베이스연결실패</h2>');
    res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다.</p>');
    res.end();
  }
});

//정보수정
// http://localhost:3000/member/edit (post)

router.route('/member/edit').post((req,res)=>{
  console.log('/member/edit 호출');
  const userid = req.body.userid;
  const userpw = req.body.userpw;
  const username = req.body.username;
  const age = req.body.age;

  console.log(`userid:${userid}, userpw:${userpw}, username:${username}, age:${age}`);

  if(database){
    editMember(database,userid,userpw,username,age,(err,result)=>{
      if(!err){// editMember(err)
        if(result.modifiedCount > 0){//editMember(result)
          res.writeHead('200', {'content-type':'text/html;charset-utf8'});
          res.write('<h2>회원정보 수정 성공</h2>');
          res.write('<p>회원정보 수정을 성공했습니다.</p>');
          res.end();
        }
        else{
          res.writeHead('200', {'content-type':'text/html;charset-utf8'});
          res.write('<h2>회원정보 수정 실패</h2>');
          res.write('<p>회원정보 수정을 실패했습니다.</p>');
          res.end();
        }
      }
      else{
        res.writeHead('200', {'content-type':'text/html;charset-utf8'});
        res.write('<h2>회원정보 수정 실패</h2>');
        res.write('<p>회원정보 수정을 실패했습니다.</p>');
        res.end();
      }
    });
  }
  else{
    res.writeHead('200', {'content-type':'text/html;charset-utf8'});
    res.write('<h2>데이터베이스 연결실패</h2>');
    res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다.</p>');
    res.end();
  }
});

//회원탈퇴
// http://localhost:3000/member/delete (post)



//---------------------------------------------
//콜백함수들

//회원가입
const joinMember = function(database,userid,userpw,username,age,callback){
  console.log('joinMember 호출');
  const members = database.collection('member');//컬렉션을 객체로 가져옴

  //members.insertMany()컬렉션을 저장
  members.insertMany([{userid:userid, userpw:userpw, username:username, age:age}],(err,result)=>{//insertMany 를 쓸때는 [배열]방식을 써야함.
    if(!err){//insert하면서 에러가 나지 않았다면
      if(result.insertedCount > 0){//insertedCount = 추가되는 객체의 갯수
        console.log(`사용자 document ${result.insertedCount}명 추가되었음.`)
      }
      else{
        console.log(`사용자 document추가가 되지 않았습니다. 정보 넣으세요`)
      }
      callback(null,result);
      return;
    }
    else{
      console.log(err);
      callback(err,null);
    }
  })
}

//로그인
const loginMember = function(database, userid, userpw, callback){
  console.log('loginMember 호출!');
  const member = database.collection('member');//컬렉션을 객체로 가져옴
  member.find({userid:userid, userpw:userpw}).toArray((err, result)=>{
    //find()는 여러객체를 찾을 수 있기 때문에 배열로 toArray를 사용.
    if(!err){//find()가 실행이 되는가?
      if(result.length > 0){ //find()가 실행되었는데, 몇개를 찾았는지 확인
        console.log('사용자를 찾았습니다.');
        callback(null,result);
      }
      else{
        console.log('일치하는 사용자가 없습니다');
        callback(null,null);
      }
    }
    else{
      console.log(err);
      callback(err,null);
    }
  })
}

//회원정보수정
const editMember = function(database,userid, userpw, username, age, callback){
  console.log('editMember호출');
  const members = database.collection('member');//컬렉션을 객체로 가지고 옴
  members.updateOne({userid:userid},{$set:{userid:userid, userpw:userpw, username:username, age:age}},(err,result)=>{
    if(!err){//modifiedCount 프로퍼티 수정한 갯수
      if(result.modifiedCount > 0){
        console.log(`사용자 document ${result.modifiedCount}명 수정됨`);
      }
      else{
        console.log('수정된 document 없음')
      }
      callback(null,result);
      return;
    }
    else{
      console.log(err);
      callback(err,null);
    }
  });
}


//--------------------------------------------------
app.use("/", router);

app.listen(port, () => {
  console.log(`${port}포트로 서버 동작중...`);
  connectDB();
});
