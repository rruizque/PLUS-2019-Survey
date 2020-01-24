function feedback(request, response) {
  /*
  let id = request.query.id;
  if (!id) {
    response.send("Survey id not specified.");
    return;
  }
  */

  let questions = pjs.query("SELECT * FROM questions");

  questions.forEach(question => {
      console.log(question);
      question.answer = pjs.query("SELECT * FROM responses WHERE question_id = ?", question.question_id);

  });

    // Must be admin
  let user = pjs.getUser();
  if (user && pjs.query("SELECT count(user) as count FROM admins WHERE user = ?", user)[0].count === 1) {
    response.render("admin/feedback.ejs", { questions });
  }
  else {
    response.send("You are not authorized.");
  }
}

exports.default = feedback;