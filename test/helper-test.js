const environment = require('dotenv').config();
const GitHubHelper = require('./github-helper');

let tester = new GitHubHelper(process.env.token);
tester.getContributorsPlus({
    ownerLogin: 'hackforla',
    repoName: 'website',
    parameters: {per_page: 100}
})
.then(function(data){
    console.log(data);
});