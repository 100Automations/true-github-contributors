require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const trueContributors = require("./contributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit({ auth: process.env.token });

(async ()=> {
    const parameters = {
        owner: "hackforla",
        repo: "website"
    };
    // Octokit's contributors endpoint that accounts for commits
    // returns 41 contributors
    let octokitContributors = await octokit.paginate(octokit.repos.listContributors, parameters);

    // trueContributors endpoint that accounts for commits and issue comments
    // returns 98 contributors
    let trueContributors = await octokit.listCommitCommentContributors(parameters);
    
})();