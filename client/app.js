var readlineSync = require("readline-sync")
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/attendance.proto"
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance
var client = new attendance_proto.AttendanceService("0.0.0.0:40000", grpc.credentials.createInsecure());


var action = readlineSync .question (
  "What would you like to do? \n"
+ " \t 1 to check in your attendance \n"
+ " \t 2 to get attendance list \n"
+ " \t 3 to get last complete month attendance stats \n" )

action = parseInt(action)
if(action === 1 ) {
  var studentNameRequest = readlineSync.question("What is your full name? (Name, Surname)")
  var codeRequest  = readlineSync.question("What is the attendance code made available by the teacher?")

  try{
    client.checkAttendance({
      studentNameRequest: studentNameRequest,
      codeRequest: codeRequest},
      function(error, response){
        try{
          console.log(response.message)
          console.log("Your attendance is now marked as : " + response.result)
        }catch(e){
          console.log("Could not connect to server.")
        }
      })
  }catch(e){
    console.log("An error Occured.")
  }
} else if(action ===2){
    var call = client.getAttendanceList({ });
    call.on('data', function(response){
        console.log( "Student Name: " + response.studentName + ". If present: (1: yes, 0: no) " +  response.present)
    });
    call.on('end', function(){});
    call.on('error', function(e){
        console.log(e)
    })

}else if(action ===3){
  var call = client.getLastMonthAttendanceStats({ });
  call.on('data', function(response){
      console.log("Attendence Stats for last complte month: ");
      console.log( "Student Name: " + response.studentName + "; Days Present: " +  response.daysPresent + "; Days Absent: " +  response.daysAbsent + "; % Presence: " +  response.percentagePresent)
  });
  call.on('end', function(){});
  call.on('error', function(e){
      console.log(e)
  })
}
