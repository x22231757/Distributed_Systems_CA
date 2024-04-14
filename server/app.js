//loading service definition
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")


var PROTO_PATH = __dirname + "/protos/attendance.proto"
//load proto file
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance

//service implementation where the logic resides
var studentList = [
  {studentName: "John, Smith",
    attendence: 0},
  {studentName: "Sally, Robinson",
    attendence: 0},
  {studentName: "Mary, Reilley",
    attendance:0},
  {studentName: "Vera, Smith",
    attendance:0},
  {studentName: "Linda, Gilmore",
    attendance:0}
]

var attendenceCode = "1T70A"

function checkAttendance(call, callback){
  try{
    var studentNameRequest = call.request.studentNameRequest
    var codeRequest = call.request.codeRequest
    //const ifInList = studentNameRequest.every(studentName => studentList.find(item => item.studentName === studentName))
    let objIndex = studentList.findIndex(
      (temp) => temp["studentName"] === studentNameRequest
      );
    if(objIndex !=-1){
      if (codeRequest == attendenceCode) {
            studentList[objIndex].attendance = 1
            //Object.keys(studentList).forEach((item) => {
            //  if(studentList[item].studentName == studentNameRequest) {
            //      studentList[item].attendance = 1
            //  }
            //})
            callback(null, {
              message : "Success, your attendence has been recorded.",
              result: studentList[objIndex].attendance
            })

      } else {
        callback(null, {
        message : "The attendence code is wrong please enter the correct code."
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


//make a new server
var server = new grpc.Server()
server.addService(attendance_proto.AttendanceService.service, {checkAttendance:checkAttendance})

server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(),
  function(){
    server.start()
  })
