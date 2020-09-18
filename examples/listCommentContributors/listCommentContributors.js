require("dotenv").config();
const fs = require('fs');
const { Octokit } = require("@octokit/rest");
const trueContributors = require("../../contributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit({ auth: process.env.token });

(async ()=> {
    const parameters = {
        owner: "hackforla",
        repo: "website"
    };
    
    // Octokit's contributors endpoint that accounts for commits
    let octokitContributors = await octokit.paginate(octokit.repos.listContributors, parameters);
    console.log(`octokitContributors returned ${octokitContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listContributors.json`, JSON.stringify(octokitContributors, null, 2));

    // trueContributors endpoint that accounts for issue comments
    let trueContributors = await octokit.listCommentContributors(parameters);
    console.log(`listCommentContributors returned ${trueContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommentContributors.json`, JSON.stringify(trueContributors, null, 2));

    // Fetching comment contributors since a given date
    let since = "2020-09-11T11:01:06.000Z";
    let trueContributorsSince = await octokit.listCommentContributors({ ...parameters, since });
    console.log(`listCommentContributors since ${since} returned ${trueContributorsSince.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommentContributorsSince.json`, JSON.stringify(trueContributorsSince, null, 2));
    
})();