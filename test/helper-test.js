const environment = require('dotenv').config();
const GitHubHelper = require('../github-helper');

let tester = new GitHubHelper(process.env.token);
tester.fetchAllSync('https://api.github.com/repos/hackforla/website')
    .then(function(res){
        console.log(res);
    });