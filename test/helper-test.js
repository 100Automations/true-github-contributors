const environment = require('dotenv').config();
const GitHubHelper = require('../github-helper');

let tester = new GitHubHelper(process.env.token);
tester.getContributorsPlus({ownerLogin: 'hackforla', repoName: 'website'})
    .then(function(data){
        console.log(data);
    });