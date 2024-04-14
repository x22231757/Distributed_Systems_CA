var readlineSync = require("readline-sync")
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

//specify which service would you like to use:
var service = readlineSync.question (
  "Which service would you like to use? \n"
+ " \t 1 for Atendance Service \n"
+ " \t 2 for Educational Portal Service \n" )

service = parseInt(service)

if(service === 1 ) { // Attendance service start
  var PROTO_PATH = __dirname + "/protos/attendance.proto"
  var packageDefinition = protoLoader.loadSync(PROTO_PATH)
  var attendance_proto = grpc.loadPackageDefinition(packageDefinition).attendance
  var client = new attendance_proto.AttendanceService("0.0.0.0:40000", grpc.credentials.createInsecure());


  var attendance_action = readlineSync.question (
    "What would you like to do? \n"
  + " \t 1 to check in your attendance \n"
  + " \t 2 to get attendance list \n"
  + " \t 3 to get last complete month attendance stats \n" )

  attendance_action = parseInt(attendance_action)
  if(attendance_action === 1 ) {
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
  } else if(attendance_action ===2){
      var call = client.getAttendanceList({ });
      call.on('data', function(response){
          console.log( "Student Name: " + response.studentName + ". If present: (1: yes, 0: no) " +  response.present)
      });
      call.on('end', function(){});
      call.on('error', function(e){
          console.log(e)
      })

  }else if(attendance_action ===3){
    var call = client.getLastMonthAttendanceStats({ });
    call.on('data', function(response){
        console.log("Attendence Stats for last complete month: ");
        console.log( "Student Name: " + response.studentName + "; Days Present: " +  response.daysPresent + "; Days Absent: " +  response.daysAbsent + "; % Presence: " +  response.percentagePresent)
    });
    call.on('end', function(){});
    call.on('error', function(e){
        console.log(e)
    })
  }

} else if(service ===2){// Attendance service end; Educational portal service start
  var PROTO_PATH = __dirname + "/protos/education_portal.proto"
  var packageDefinition = protoLoader.loadSync(PROTO_PATH)
  var education_portal_proto = grpc.loadPackageDefinition(packageDefinition).education_portal
  var client = new education_portal_proto.EducationPortalService("0.0.0.0:40000", grpc.credentials.createInsecure());


  var education_portal_action = readlineSync.question (
    "What would you like to do? \n"
  + " \t 1 to complte a quiz \n")


  education_portal_action = parseInt(education_portal_action)
  if(education_portal_action === 1 ) {


    var call = client.completeQuiz(function(error, response){
       if(error){
          console .log("An error has occured")
      }else{
        console .log("You have ordered " + response .books + " the total cost is : " + response .price )
      }
    })

    var geographyTestQuestions = [
      {questionNumber: 1, question: "What is the imaginary line that divides the world around the middle and runs West to East? Answer: "},
      {questionNumber: 2, question: "What are the lines running parallel to the equator? Answer: "},
      {questionNumber: 3, question: "What is the imaginary line that runs from the North Pole to the South Pole and runs through Greenwich, England? Answer: "},
      {questionNumber: 4, question: "What are the lines running parallel to the Prime Meridian? Answer: "},
      {questionNumber: 5, question: "True or False - the parallels mesure latitude and the meridians measure longitude? Answer: "}
    ]

    for (var i = 0; i < geographyTestQuestions.length; i++){
       var quiz_answer = readlineSync.question(geographyTestQuestions[i].question)
       if(quiz_answer.toLowerCase() === "q"){
         break
       }
       call.write({
         quiz_answer  :quiz_answer ,
       })
     }
     call .end()


  }
}//Educational portal service start
