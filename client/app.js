var readlineSync = require("readline-sync")
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/attendance.proto"
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance
var client = new attendance_proto.AttendanceService("0.0.0.0:40000", grpc.credentials.createInsecure());

var studentNameRequest = readlineSync.question("What is your full name? (Name, Surname)")
var codeRequest  = readlineSync.question("What is the attendence code made available by the teacher?")

try{
  client.checkAttendance({
    studentNameRequest: studentNameRequest,
    codeRequest: codeRequest},
    function(error, response){
      try{
        console.log(response.message)
        console.log("Your attendence is now marked as : " + response.result)
      }catch(e){
        console.log("Could not connect to server.")
      }
    })
}catch(e){
  console.log("An error Occured.")
}
