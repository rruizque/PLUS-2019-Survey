
function survey(req, res) {

  let id = req.query.id;
  if (!id) {
    res.send("Survey id not specified.");
    return;
  }

  let survey = pjs.query("SELECT * FROM surveys WHERE id = ?", id)[0];
  if (!survey) {
    res.send("Invalid survey id.");
    return;
  }

  let user = pjs.getUser();
  if (!user) {
    // client-side redirect to login
    res.send(`
      <script>
        location.href = "/signin?title=" + encodeURIComponent("${survey.name}");
      </script>
    `);
    return;
  }

  let questions = pjs.query("SELECT * FROM questions WHERE survey_id = ? ORDER BY question_id", id);


  if (req.method === "POST") {
    questions.forEach(question => {
      let response = {
        survey_id: id,
        user,
        question_id: question.question_id,
        free_form_response: req.body["free_form_question" + question.question_id],
        timestamp: new Date()
      }
      if (question.type === "radio buttons") {
        for (let x = 1; x <= 5; x++) {
          if (req.body["question" + question.question_id] === "choice" + x) {
            response.choice_response = question["choice" + x];
          }
        }
      }
      if (question.type === "checkboxes") {
        response.choice_response = [];
        for (let x = 1; x <= 5; x++) {
          if (req.body["question" + question.question_id + "_choice" + x]) {
            response.choice_response.push(question["choice" + x]);
          }
        }
        response.choice_response = response.choice_response.join(", ");
      }
      pjs.query("INSERT INTO responses SET ?", response);
    })
    res.send("<h2 style = 'font-family: Arial, Helvetica, sans-serif; padding: 7% 0 5% 0; vertical-align: middle; background-color:#0B69B8; color: white; width: 100%; text-align: center;'>We appreciate you took the time to give us your feedback. Thank you!</h2>");
  }

  if (req.method === "GET") {  
    res.render("survey.ejs", { user, survey, questions });
  }

}

exports.default = survey;
