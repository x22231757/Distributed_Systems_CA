var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

//This is a proto for attendance service
var PROTO_PATH = __dirname + "/protos/attendance.proto"
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance

//This is  a proto for Educational Portal service
var PROTO_PATH_EDUCATIONAL_PORTAL = __dirname + "/protos/education_portal.proto"
var packageDefinitionEducationPortal = protoLoader.loadSync(PROTO_PATH_EDUCATIONAL_PORTAL)
var education_portal_proto = grpc.loadPackageDefinition(packageDefinitionEducationPortal).education_portal

//This is  a proto for Chat service
var PROTO_PATH_CHAT = __dirname + "/protos/chat.proto"
var packageDefinitionChat = protoLoader.loadSync(PROTO_PATH_CHAT)
var chat_proto = grpc.loadPackageDefinition(packageDefinitionChat).chat

//This defines the multiple clients for the chat service
var clients = {}

//This is the list of objects; key value pair defining studenta and their attendence attributes
var studentList = [
  {studentName: "John, Smith", attendance:0, daysPresent: 19, daysAbsent: 2, percentagePresent:90 },
  {studentName: "Sally, Robinson", attendance:0,  daysPresent: 17, daysAbsent: 4, percentagePresent:81},
  {studentName: "Mary, Reilley", attendance:0,  daysPresent: 20, daysAbsent: 1, percentagePresent:95},
  {studentName: "Vera, Smith", attendance:0,  daysPresent: 19, daysAbsent: 2, percentagePresent:90},
  {studentName: "Linda, Gilmore", attendance:0,  daysPresent: 21, daysAbsent: 0, percentagePresent:100}
]

//This is the attendence code that corresponds to the code provided by the teacher to check attendence
var attendanceCode = "1T70A"

//This is checkAttendence function implementation
function checkAttendance(call, callback){
  try{
    //Get the client input
    var studentNameRequest = call.request.studentNameRequest
    var codeRequest = call.request.codeRequest
    //Check if the inputted parameters are in the studentList
    var objIndex = studentList.findIndex(
      (temp) => temp["studentName"] === studentNameRequest
      );
    //If the client inputted parameters are in the list
    if(objIndex !=-1){
      //If the inputted code equals the teacher code
      if (codeRequest == attendanceCode) {
        //Update the attendence to 1
            studentList[objIndex].attendance = 1
            callback(null, {
              message : "Success, your attendance has been recorded.",
              result: studentList[objIndex].attendance
            })
      //If the inputted code does not equals the teacher code
      } else {
        callback(null, {
          message : "The attendance code is wrong please enter the correct code.",
          result: studentList[objIndex].attendance
      })
      }
      //If the client inputted parameters are not in the studentList
    }else{
      callback(null,{
        message:"Your name was not afound among student list. Please repeat the process."
    })
  }
  }catch(e){
    callback(null,{
    message: "Error Occured."
  })}
}

//This is getAttendanceList function implementation
function getAttendanceList(call, callback){
  try{
    //Loop though all the items in hte studentList
    for(var i = 0; i < studentList.length; i++){
      call.write({
        studentName: studentList[i].studentName,
        present: studentList[i].attendance
      })
    }
    call.end()
  }catch(e){
    callback(null,{
    message: "Error Occurred."
  })}
}

//This is getLastMonthAttendanceStats function implementation to get stream of data on attendance stats
function getLastMonthAttendanceStats(call, callback){
  try{
    //Loop though all the items in hte studentList
    for(var i = 0; i < studentList.length; i++){
      call.write({
        studentName: studentList[i].studentName,
        daysPresent: studentList[i].daysPresent,
        daysAbsent: studentList[i].daysAbsent,
        percentagePresent:studentList[i].percentagePresent ,
      })
    }
    call.end()
  }catch(e){
    callback(null,{
    message: "Error Occurred."
  })}
}


//This is uploadQuiz function implementation to upload a quiz into a database
function uploadQuiz(call, callback){
  //Initialise the number of questions variable
   var numOfQuestions = 0


   call.on('data', function(request){
     //Count the number of questions submitted
     numOfQuestions +=1
   })

   call.on('end', function(){
     //Generate the unique reference number with the Date object
     var quizRefNumber = new Date().valueOf();

     callback(null, {
       numOfQuestions  : numOfQuestions ,
       quizRefNumber : quizRefNumber
     })
     //Output on the serverside
     console.log("Your quiz has been uploaded.");
   })
   call .on('error', function(e){
     console.log('An error occurred ')
 })
}

//This is sendMessage function implementation for the chat service
function sendMessage(call){
   call.on('data', function(chat_message){
     // Check if the name of the sender is in clients
      if(!(chat_message.name in clients)){
         clients[chat_message .name] = {
            name : chat_message.name,
            call : call
          }
        }
        //Loop though the clients to write to the call
        for(var client in clients){
           clients[client].call .write({
              name : chat_message.name,
              message : chat_message.message
            })
          }
    });

  call.on('end', function(){
     call.end() ;
  })

  call.on('error', function(e){
    console.log(e)
  })
}




//Instattiade a new server
var server = new grpc.Server()
//Add AttendanceService into the server
server.addService(attendance_proto.AttendanceService.service, {
  checkAttendance:checkAttendance,
  getAttendanceList: getAttendanceList,
  getLastMonthAttendanceStats : getLastMonthAttendanceStats
 })
//Add EducationPortalService into the server
 server.addService(education_portal_proto.EducationPortalService.service, {
   uploadQuiz:uploadQuiz

  })
  //Add ChatService into the server
 server.addService(chat_proto.ChatService.service, { sendMessage:sendMessage })


server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(),
  function(){
    server.start()
  })
