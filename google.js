// This file contains abstractions for Google APIs.
exports.getCourses = (auth) => {
  return new Promise(async (r) => {
    var classroomAPI = googleapis.classroom({
      version: 'v1',
      auth: auth.auth
    })
    classroomAPI.courses.list({ pageSize: 0 }, (err, res) => {
      var courses = res.data.courses;
      var result = []
      courses.forEach(course => {
        result.push({
          name: course.name,
          id: course.id
        })
      })
      r(result)
    })
  })
}
exports.getStudents = (auth, id) => {
  return new Promise(async (r) => {
    var classroomAPI = googleapis.classroom({
      version: 'v1',
      auth: auth.auth
    })
    classroomAPI.courses.students.list({ courseId: id, pageSize: 0 }, (err, res) => {
      var students = res.data.students
      var result = []
      students.forEach(student => {
        result.push({
          name: student.profile.name.fullName,
          address: student.profile.emailAddress
        })
      });
    })
  })
}
