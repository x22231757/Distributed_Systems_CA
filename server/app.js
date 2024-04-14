var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

//This is for attendance service
var PROTO_PATH = __dirname + "/protos/attendance.proto"
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance

//This is for Educational Portal service
var PROTO_PATH_EDUCATIONAL_PORTAL = __dirname + "/protos/education_portal.proto"
var packageDefinitionEducationPortal = protoLoader.loadSync(PROTO_PATH_EDUCATIONAL_PORTAL)
var education_portal_proto = grpc.loadPackageDefinition(packageDefinitionEducationPortal).education_portal


var studentList = [
  {studentName: "John, Smith", attendance:0, daysPresent: 19, daysAbsent: 2, percentagePresent:90 },
  {studentName: "Sally, Robinson", attendance:0,  daysPresent: 17, daysAbsent: 4, percentagePresent:81},
  {studentName: "Mary, Reilley", attendance:0,  daysPresent: 20, daysAbsent: 1, percentagePresent:95},
  {studentName: "Vera, Smith", attendance:0,  daysPresent: 19, daysAbsent: 2, percentagePresent:90},
  {studentName: "Linda, Gilmore", attendance:0,  daysPresent: 21, daysAbsent: 0, percentagePresent:100}
]

var attendanceCode = "1T70A"

function checkAttendance(call, callback){
  try{
    var studentNameRequest = call.request.studentNameRequest
    var codeRequest = call.request.codeRequest
    var objIndex = studentList.findIndex(
      (temp) => temp["studentName"] === studentNameRequest
      );
    if(objIndex !=-1){
      if (codeRequest == attendanceCode) {
            studentList[objIndex].attendance = 1
            callback(null, {
              message : "Success, your attendance has been recorded.",
              result: studentList[objIndex].attendance
            })

      } else {
        callback(null, {
          message : "The attendance code is wrong please enter the correct code.",
          result: studentList[objIndex].attendance
      })
      }
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

function getAttendanceList(call, callback){
  try{
    for(var i = 0; i < studentList.length; i++){
      call.write({
        studentName: studentList[i].studentName,
        present: studentList[i].attendance
      })
    }
    call.end()
  }catch(e){
    callback(null,{
    message: "Error Occured."
  })}
}

function getLastMonthAttendanceStats(call, callback){
  try{
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
    message: "Error Occured."
  })}
}

var geographyTestAnswers = [
  {questionNumber: 1,  answer: "Equator"},
  {questionNumber: 2,  answer: "Parallels"},
  {questionNumber: 3,  answer: "Prime Meridian"},
  {questionNumber: 4,  answer: "Meridians"},
  {questionNumber: 5,  answer: "True"}
]

function completeQuiz(call, callback){
   var numberAnwersCorrect = 0
   var numberAnwersWrong = 0

   call.on('data', function(request){
     if (request.quiz_answer = geographyTestAnswers[i].answer) {
       numberAnwersCorrect += 1
     }else {
       numberAnwersWrong += 1
     }
   })

   call.on('end', function(){
     callback(null, {
       numberAnwersCorrect : numberAnwersCorrect,
       numberAnwersWrong: numberAnwersWrong
     })
   })
   call .on('error', function(e){
     console.log('An error occured ')
 })
}





var server = new grpc.Server()
server.addService(attendance_proto.AttendanceService.service, {
  checkAttendance:checkAttendance,
  getAttendanceList: getAttendanceList,
  getLastMonthAttendanceStats : getLastMonthAttendanceStats
 })

server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(),
  function(){
    server.start()
  })
