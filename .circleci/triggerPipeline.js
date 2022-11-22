// INSTALLATION
/*
  npm install node-fetch
*/

// PURPOSE
/* 
  Manually trigger a CircleCI pipeline via the CircleCI API.
*/

/*
const token = "c41676c4a11eb837315c0ea638d9d9e79d984957";
const branch = "QA-10-cypress_automation";
const project_slug = "gh/svinstech/marketingqa";
TriggerCircleCiPipeline(token, branch, project_slug);

function TriggerCircleCiPipeline(_personal_api_token, _branch, _project_slug) {
    const fetch = require('node-fetch');
  
    const url = `https://circleci.com/api/v2/project/${_project_slug}/pipeline`;
    const body = JSON.stringify({branch: _branch});
    const headers = {
      "content-type": "application/json",
      "Circle-Token": _personal_api_token
    };
    const options = { 
      method: "POST", 
      body: body, 
      headers: headers
    };
  
    console.log("Sending API call...");
  
    fetch(url, options)
      .then(function(res) {
        console.log(`Status: ${res.status}`);
        return res.json();
      }).then(function(json) {
        console.log(json);
      }).catch(function(error) {
        console.log(`!!! ERROR: ${error}`)
      });
  }
*/
  