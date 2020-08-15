require('dotenv').config();
const GitHubHelper = require('../github-helper');

let tester = new GitHubHelper(process.env.token);
tester.getCombinedContributors({owner: "github", repo: "opensourcefriday"})
    .then(function(res){
        console.log(res);
    });